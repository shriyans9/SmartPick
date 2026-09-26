import os
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

from providers.google_shopping import search_google_shopping
from providers.ebay import search_ebay_products


# -----------------------------------------
# Product search cache
# -----------------------------------------

PRODUCT_CACHE = {}

CACHE_TTL = 600  # 10 minutes


# -----------------------------------------
# Shared search executor
# -----------------------------------------

SEARCH_EXECUTOR = ThreadPoolExecutor(
    max_workers=4
)


# -----------------------------------------
# Normalize eBay product
# -----------------------------------------

def normalize_ebay_product(item):

    price_data = item.get("price", {})

    return {
        "source": "eBay",

        "position": item.get("itemId"),

        "product_id": item.get("itemId"),

        "title": item.get("title"),

        "price": (
            price_data.get("value")
            if isinstance(price_data, dict)
            else price_data
        ),

        "currency": (
            price_data.get("currency")
            if isinstance(price_data, dict)
            else "INR"
        ),

        "thumbnail": (
            item.get("image", {}).get("imageUrl")
            if isinstance(item.get("image"), dict)
            else None
        ),

        "product_link": item.get("itemWebUrl"),

        "rating": None,

        "reviews": None,

        "delivery": None,

        "snippet": None
    }


# -----------------------------------------
# Normalize Google Shopping product
# -----------------------------------------

def normalize_serpapi_product(item):

    return {
        "source": item.get("source"),

        "position": item.get("position"),

        "product_id": item.get("product_id"),

        "title": item.get("title"),

        "price": item.get("price"),

        "currency": "INR",

        "thumbnail": item.get("thumbnail"),

        "product_link": item.get("product_link"),

        "rating": item.get("rating"),

        "reviews": item.get("reviews"),

        "delivery": item.get("delivery"),

        "snippet": item.get("snippet")
    }


# -----------------------------------------
# Main Product Search
# -----------------------------------------

def search_products(
    query,
    location="India",
    ebay_offset=0
):

    query = query.strip()

    if not query:
        return []


    # -----------------------------------------
    # SEARCH LOG
    # -----------------------------------------

    print("\n" + "=" * 60)

    print(
        f"PRODUCT SEARCH: {query}"
    )

    print("=" * 60)


    # -----------------------------------------
    # CACHE CHECK
    # -----------------------------------------

    cache_key = (
        f"{query.lower()}|"
        f"{location.lower()}|"
        f"{ebay_offset}"
    )

    cached = PRODUCT_CACHE.get(cache_key)

    if cached:

        cached_time, cached_products = cached

        if (
            time.time() - cached_time
            < CACHE_TTL
        ):

            print(
                f"CACHE HIT: {query} "
                f"({len(cached_products)} products)"
            )

            return cached_products

        else:

            del PRODUCT_CACHE[cache_key]


           # -----------------------------------------
    # PRODUCT COLLECTION
    # -----------------------------------------

    all_products = []


    # -----------------------------------------
    # FUTURES
    # -----------------------------------------

    futures = {}


    # -----------------------------------------
    # GOOGLE SHOPPING
    # -----------------------------------------

    if (
    ebay_offset == 0
    and os.getenv("SERPAPI_KEY")
):


        google_future = SEARCH_EXECUTOR.submit(
            search_google_shopping,
            query,
            location
        )

        futures[google_future] = "serpapi"


    # -----------------------------------------
    # EBAY
    # -----------------------------------------

    ebay_future = SEARCH_EXECUTOR.submit(
        search_ebay_products,

        query=query,

        # eBay can return up to 200 products
        limit=200,

        offset=ebay_offset,

        marketplace_id="EBAY_US"
    )

    futures[ebay_future] = "ebay"


    # -----------------------------------------
    # COLLECT RESULTS
    # -----------------------------------------

    for future in as_completed(futures):

        provider = futures[future]

        try:

            results = future.result()


            # -------------------------------------
            # NO RESULTS
            # -------------------------------------

            if not results:

                print(
                    f"{provider.upper()}: "
                    f"0 products"
                )

                continue


            # -------------------------------------
            # GOOGLE SHOPPING
            # -------------------------------------

            if provider == "serpapi":

                for item in results:

                    try:

                        product = (
                            normalize_serpapi_product(
                                item
                            )
                        )

                        if product:

                            all_products.append(
                                product
                            )

                    except Exception as error:

                        print(
                            "GOOGLE PRODUCT "
                            f"NORMALIZATION ERROR: "
                            f"{error}"
                        )


            # -------------------------------------
            # EBAY
            # -------------------------------------

            elif provider == "ebay":

                for item in results:

                    try:

                        product = (
                            normalize_ebay_product(
                                item
                            )
                        )

                        if product:

                            all_products.append(
                                product
                            )

                    except Exception as error:

                        print(
                            "EBAY PRODUCT "
                            f"NORMALIZATION ERROR: "
                            f"{error}"
                        )


            # -------------------------------------
            # PROVIDER LOG
            # -------------------------------------

            print(
                f"{provider.upper()}: "
                f"{len(results)} products"
            )


        except Exception as error:

            print(
                f"{provider.upper()} ERROR: "
                f"{error}"
            )


    # -----------------------------------------
    # REMOVE DUPLICATES
    # -----------------------------------------

    unique_products = {}


    for product in all_products:

        product_id = product.get(
            "product_id"
        )


        title = (
            product.get("title")
            or ""
        ).strip().lower()


        source = (
            product.get("source")
            or ""
        ).strip().lower()


        # -------------------------------------
        # PRODUCT ID AVAILABLE
        # -------------------------------------

        if product_id:

            key = (
                source,
                product_id
            )


        # -------------------------------------
        # PRODUCT ID NOT AVAILABLE
        # -------------------------------------

        else:

            key = (
                source,
                title
            )


        if key not in unique_products:

            unique_products[key] = product


    # -----------------------------------------
    # FINAL UNIQUE PRODUCTS
    # -----------------------------------------

    products = list(
        unique_products.values()
    )


    # -----------------------------------------
    # SAVE CACHE
    # -----------------------------------------

    PRODUCT_CACHE[cache_key] = (
        time.time(),
        products
    )


    # -----------------------------------------
    # LOGGING
    # -----------------------------------------

    print(
        f"RAW PRODUCTS: "
        f"{len(all_products)}"
    )

    print(
        f"UNIQUE PRODUCTS: "
        f"{len(products)}"
    )

    print("=" * 60)


    # -----------------------------------------
    # RETURN
    # -----------------------------------------

    return products


    # -----------------------------------------
    # EBAY
    # -----------------------------------------

    ebay_future = SEARCH_EXECUTOR.submit(
        search_ebay_products,
        query=query,

        # One API request can return
        # up to 200 products.
        limit=200,

        offset=ebay_offset,

        marketplace_id="EBAY_US"
    )

    futures[ebay_future] = "ebay"


    # -----------------------------------------
    # COLLECT RESULTS
    # -----------------------------------------

    for future in as_completed(futures):

        provider = futures[future]

        try:

            results = future.result()


            if not results:

                print(
                    f"{provider.upper()}: "
                    f"0 products"
                )

                continue


            # ---------------------------------
            # eBay results
            # ---------------------------------

            if provider == "ebay":

                for item in results:

                    all_products.append(
                        normalize_ebay_product(
                            item
                        )
                    )


            # ---------------------------------
            # Google Shopping results
            # ---------------------------------

            elif provider == "serpapi":

                for item in results:

                    all_products.append(
                        normalize_serpapi_product(
                            item
                        )
                    )


            print(
                f"{provider.upper()}: "
                f"{len(results)} products"
            )


        except Exception as error:

            print(
                f"{provider.upper()} ERROR: "
                f"{error}"
            )


    # -----------------------------------------
    # REMOVE DUPLICATES
    # -----------------------------------------

    unique_products = {}


    for product in all_products:

        product_id = product.get(
            "product_id"
        )


        title = (
            product.get("title") or ""
        ).strip().lower()


        source = (
            product.get("source") or ""
        ).strip().lower()


        # -------------------------------------
        # Product ID available
        # -------------------------------------

        if product_id:

            key = (
                source,
                product_id
            )


        # -------------------------------------
        # Product ID unavailable
        # -------------------------------------

        else:

            key = (
                source,
                title
            )


        if key not in unique_products:

            unique_products[key] = product


    products = list(
        unique_products.values()
    )


    # -----------------------------------------
    # SAVE TO CACHE
    # -----------------------------------------

    PRODUCT_CACHE[cache_key] = (
        time.time(),
        products
    )


    # -----------------------------------------
    # LOGGING
    # -----------------------------------------

    print(
        f"RAW PRODUCTS: "
        f"{len(all_products)}"
    )

    print(
        f"UNIQUE PRODUCTS: "
        f"{len(products)}"
    )

    print("=" * 60)


    # -----------------------------------------
    # RETURN PRODUCTS
    # -----------------------------------------

    return products