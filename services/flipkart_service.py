# ---------------------------------------
# FLIPKART SERVICE
# ---------------------------------------

import os
import requests


FLIPKART_API_URL = (
    "https://affiliate-api.flipkart.net/affiliate/"
    "1.0/search.json"
)


def search_flipkart_products(
    query,
    result_count=10
):

    # ---------------------------------------
    # GET API CREDENTIALS
    # ---------------------------------------

    api_token = os.getenv(
        "FLIPKART_API_TOKEN"
    )

    if not api_token:

        print(
            "FLIPKART ERROR: "
            "FLIPKART_API_TOKEN is not configured"
        )

        return []

    # ---------------------------------------
    # VALIDATE QUERY
    # ---------------------------------------

    if not query or not query.strip():

        return []

    query = query.strip()

    # ---------------------------------------
    # REQUEST PARAMETERS
    # ---------------------------------------

    params = {
        "query": query,
        "resultCount": result_count
    }

    # ---------------------------------------
    # REQUEST HEADERS
    # ---------------------------------------

    headers = {
        "Fk-Affiliate-Id": os.getenv(
            "FLIPKART_AFFILIATE_ID",
            ""
        ),
        "Fk-Affiliate-Token": api_token
    }

    try:

        print(
            f"FLIPKART SEARCH: {query}"
        )

        response = requests.get(
            FLIPKART_API_URL,
            params=params,
            headers=headers,
            timeout=15
        )

        print(
            "FLIPKART STATUS:",
            response.status_code
        )

        response.raise_for_status()

        data = response.json()

        # ---------------------------------------
        # GET PRODUCTS
        # ---------------------------------------

        products = []

        raw_products = (
            data.get("productInfoList", [])
        )

        for item in raw_products:

            product_info = item.get(
                "productBaseInfo",
                {}
            )

            product_attributes = (
                product_info.get(
                    "productAttributes",
                    {}
                )
            )

            title = product_attributes.get(
                "title",
                ""
            )

            price = product_attributes.get(
                "sellingPrice",
                {}
            )

            image = product_attributes.get(
                "imageUrls",
                {}
            )

            product_url = product_attributes.get(
                "productUrl",
                ""
            )

            products.append({

                "title": title,

                "price": price.get(
                    "amount"
                ),

                "currency": "INR",

                "image": (
                    image.get("400x400")
                    or image.get("200x200")
                    or ""
                ),

                "url": product_url,

                "source": "Flipkart"

            })

        print(
            f"FLIPKART: "
            f"{len(products)} products found"
        )

        return products

    except Exception as error:

        print(
            "FLIPKART ERROR:",
            str(error)
        )

        return []