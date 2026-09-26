import os
import time
import base64
import requests
from dotenv import load_dotenv

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")

EBAY_CLIENT_ID = os.getenv("EBAY_CLIENT_ID")
EBAY_CLIENT_SECRET = os.getenv("EBAY_CLIENT_SECRET")
print("eBay Client ID loaded:", bool(EBAY_CLIENT_ID))
print("eBay Client Secret loaded:", bool(EBAY_CLIENT_SECRET))

EBAY_API_URL = "https://api.ebay.com"
EBAY_TOKEN_URL = "https://api.ebay.com/identity/v1/oauth2/token"

# Cache token so we don't request a new token for every search
_token_cache = {
    "access_token": None,
    "expires_at": 0
}


def get_ebay_access_token():
    """
    Get/reuse an eBay Application Access Token.
    """

    if (
        _token_cache["access_token"]
        and time.time() < _token_cache["expires_at"] - 60
    ):
        return _token_cache["access_token"]

    if not EBAY_CLIENT_ID or not EBAY_CLIENT_SECRET:
        raise RuntimeError(
            "EBAY_CLIENT_ID or EBAY_CLIENT_SECRET missing in .env"
        )

    credentials = f"{EBAY_CLIENT_ID}:{EBAY_CLIENT_SECRET}"

    encoded_credentials = base64.b64encode(
        credentials.encode()
    ).decode()

    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": f"Basic {encoded_credentials}"
    }

    data = {
        "grant_type": "client_credentials",
        "scope": "https://api.ebay.com/oauth/api_scope"
    }

    response = requests.post(
        EBAY_TOKEN_URL,
        headers=headers,
        data=data,
        timeout=10
    )

    if response.status_code != 200:
        print("EBAY STATUS:", response.status_code)
        print("EBAY RESPONSE:", response.text)
        return None

    token_data = response.json()

    access_token = token_data["access_token"]
    expires_in = token_data.get("expires_in", 7200)

    _token_cache["access_token"] = access_token
    _token_cache["expires_at"] = time.time() + expires_in

    print("eBay access token created")

    return access_token


def search_ebay_products(
    query,
    limit=200,
    offset=0,
    marketplace_id="EBAY_US"
):
    """
    Search eBay using the Browse API.

    One request can return up to 200 products.
    offset allows SmartPick to request the next page later.
    """

    query = query.strip()

    if not query:
        return []

    token = get_ebay_access_token()

    if not token:
        return []

    url = (
        f"{EBAY_API_URL}"
        "/buy/browse/v1/item_summary/search"
    )

    headers = {
        "Authorization": f"Bearer {token}",
        "X-EBAY-C-MARKETPLACE-ID": marketplace_id,
        "Accept": "application/json"
    }

    params = {
        "q": query,
        "limit": min(limit, 200),
        "offset": offset
    }

    start_time = time.time()

    try:

        response = requests.get(
            url,
            headers=headers,
            params=params,
            timeout=10
        )

        response.raise_for_status()

        data = response.json()

        items = data.get(
            "itemSummaries",
            []
        )

        total = data.get(
            "total",
            0
        )

        elapsed = time.time() - start_time

        print(
            f"EBAY PAGE: "
            f"offset={offset}, "
            f"received={len(items)}, "
            f"ebay_total={total}"
        )

        print(
            f"EBAY TIME: {elapsed:.2f} seconds"
        )

        print(
            f"EBAY PRODUCTS: {len(items)}"
        )

        return items

    except requests.Timeout:

        print("EBAY TIMEOUT")

        return []

    except requests.RequestException as e:

        print(
            f"EBAY ERROR: {e}"
        )

        return []