import os
import time
import requests


SERPAPI_URL = "https://serpapi.com/search"


# ---------------------------------------
# CACHE
# ---------------------------------------

CACHE = {}

CACHE_TTL = 600  # 10 minutes


# ---------------------------------------
# GOOGLE SHOPPING SEARCH
# ---------------------------------------

def search_google_shopping(
    query,
    location="India",
    max_products=40
):
    """
    Search Google Shopping using SerpApi.

    Google Shopping currently returns
    approximately one page of products
    per request.

    max_products is kept here so we can
    support larger result collection later.
    """

    # ---------------------------------------
    # GET API KEY
    # ---------------------------------------

    api_key = os.getenv("SERPAPI_KEY")

    if not api_key:

        raise RuntimeError(
            "SERPAPI_KEY is not configured"
        )


    # ---------------------------------------
    # CLEAN QUERY
    # ---------------------------------------

    query = query.strip()

    if not query:

        return []


    # ---------------------------------------
    # CACHE KEY
    # ---------------------------------------

    cache_key = (
        f"{query.lower()}|"
        f"{location.lower()}|"
        f"{max_products}"
    )


    # ---------------------------------------
    # CHECK CACHE
    # ---------------------------------------

    if cache_key in CACHE:

        cached_time, cached_products = CACHE[
            cache_key
        ]

        if (
            time.time() - cached_time
            < CACHE_TTL
        ):

            print(
                f"GOOGLE CACHE HIT: "
                f"{query} | "
                f"{len(cached_products)} products"
            )

            return cached_products

        else:

            del CACHE[cache_key]


    # ---------------------------------------
    # SERPAPI PARAMETERS
    # ---------------------------------------

    params = {

        "engine": "google_shopping",

        "q": query,

        # -----------------------------------
        # INDIA
        # -----------------------------------

        "location": location,

        "gl": "in",

        "hl": "en",

        "google_domain": "google.co.in",

        # -----------------------------------
        # API KEY
        # -----------------------------------

        "api_key": api_key,

        # -----------------------------------
        # IMPORTANT
        #
        # Google Shopping currently returns
        # approximately 40 results.
        # -----------------------------------

        "num": 40
    }


    # ---------------------------------------
    # START TIMER
    # ---------------------------------------

    start_time = time.time()


    try:

        # -----------------------------------
        # REQUEST
        # -----------------------------------

        response = requests.get(

            SERPAPI_URL,

            params=params,

            timeout=15
        )


        # -----------------------------------
        # TIME
        # -----------------------------------

        elapsed = (
            time.time()
            - start_time
        )


        print(
            f"GOOGLE SHOPPING TIME: "
            f"{elapsed:.2f}s | "
            f"QUERY: {query}"
        )


        # -----------------------------------
        # HTTP ERROR
        # -----------------------------------

        response.raise_for_status()


        # -----------------------------------
        # JSON
        # -----------------------------------

        data = response.json()


        # -----------------------------------
        # RESPONSE KEYS
        # -----------------------------------

        print(
            "SERPAPI RESPONSE KEYS:",
            list(data.keys())
        )


        # -----------------------------------
        # SERPAPI ERROR
        # -----------------------------------

        if data.get("error"):

            print(
                "SERPAPI API ERROR:",
                data.get("error")
            )

            return []


        # -----------------------------------
        # SHOPPING RESULTS
        # -----------------------------------

        results = data.get(
            "shopping_results",
            []
        ) or []


        # -----------------------------------
        # DEBUG RESULT TYPE
        # -----------------------------------

        print(
            "DEBUG RESULTS TYPE:",
            type(results)
        )


        # -----------------------------------
        # DEBUG RESULT LENGTH
        # -----------------------------------

        print(
            "DEBUG RESULTS LENGTH:",
            len(results)
        )


        # -----------------------------------
        # GOOGLE RESULT COUNT
        # -----------------------------------

        print(
            "GOOGLE SHOPPING PAGE 1:",
            len(results),
            "products"
        )


        # -----------------------------------
        # EMPTY RESULTS
        # -----------------------------------

        if not results:

            print(
                "GOOGLE SHOPPING: "
                "No products returned"
            )

            return []


        # -----------------------------------
        # STORE RESULTS
        # -----------------------------------

        all_results = []

        all_results.extend(
            results
        )


        # -----------------------------------
        # DEBUG AFTER EXTEND
        # -----------------------------------

        print(
            "DEBUG TOTAL AFTER EXTEND:",
            len(all_results)
        )


        # -----------------------------------
        # PAGINATION INFORMATION
        # -----------------------------------

        pagination = data.get(
            "serpapi_pagination",
            {}
        ) or {}


        # -----------------------------------
        # DEBUG PAGINATION TYPE
        # -----------------------------------

        print(
            "DEBUG PAGINATION TYPE:",
            type(pagination)
        )


        # -----------------------------------
        # GET NEXT PAGE
        # -----------------------------------

        next_url = pagination.get(
            "next"
        )


        # -----------------------------------
        # DEBUG NEXT URL
        # -----------------------------------

        print(
            "GOOGLE NEXT PAGE:",
            bool(next_url)
        )


        if next_url:

            print(
                "GOOGLE NEXT URL:",
                next_url
            )

        else:

            print(
                "GOOGLE SHOPPING: "
                "No next page available"
            )


        # -----------------------------------
        # LIMIT RESULTS
        # -----------------------------------

        all_results = all_results[
            :max_products
        ]


        # -----------------------------------
        # SAVE CACHE
        # -----------------------------------

        CACHE[cache_key] = (

            time.time(),

            all_results
        )


        # -----------------------------------
        # FINAL DEBUG
        # -----------------------------------

        print(
            "DEBUG FINAL RESULT LENGTH:",
            len(all_results)
        )


        print(
            f"GOOGLE SHOPPING TOTAL: "
            f"{len(all_results)} products"
        )


        # -----------------------------------
        # RETURN
        # -----------------------------------

        return all_results


    # ---------------------------------------
    # TIMEOUT
    # ---------------------------------------

    except requests.Timeout:

        print(
            "GOOGLE SHOPPING TIMEOUT:",
            query
        )

        return []


    # ---------------------------------------
    # REQUEST ERROR
    # ---------------------------------------

    except requests.RequestException as error:

        print(
            "GOOGLE SHOPPING REQUEST ERROR:",
            error
        )

        return []


    # ---------------------------------------
    # UNEXPECTED ERROR
    # ---------------------------------------

    except Exception as error:

        print(
            "GOOGLE SHOPPING UNEXPECTED ERROR:",
            error
        )

        return []