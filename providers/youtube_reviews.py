import os
import requests
import time

from urllib.parse import quote_plus

YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/search"

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

def create_youtube_search_link(product_name):

    product_name = (product_name or "").strip()

    if not product_name:
        return ""

    search_query = f"{product_name} review"

    return (
        "https://www.youtube.com/results?search_query="
        + quote_plus(search_query)
    )
def search_youtube_reviews(product_title, max_results=3):

    if not YOUTUBE_API_KEY:
        print("YOUTUBE_API_KEY is not configured")
        return []

    if not product_title:
        return []

    # Clean the product title before searching
    query = f"{product_title} review"

    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": max_results,

        # India
        "regionCode": "IN",
        "relevanceLanguage": "en",

        # Only return videos that can be played
        # outside youtube.com
        "videoSyndicated": "true",

        "key": YOUTUBE_API_KEY
    }

    start_time = time.time()

    try:

        response = requests.get(
            YOUTUBE_API_URL,
            params=params,
            timeout=5
        )

        elapsed = time.time() - start_time

        print(
            f"YOUTUBE SEARCH: "
            f"{query} | "
            f"{elapsed:.2f}s"
        )

        response.raise_for_status()

        data = response.json()

        if data.get("error"):
            print(
                "YOUTUBE API ERROR:",
                data["error"]
            )
            return []

        videos = []

        for item in data.get("items", []):

            video_id = (
                item.get("id", {})
                .get("videoId")
            )

            snippet = item.get(
                "snippet",
                {}
            )

            if not video_id:
                continue

            videos.append({

                "video_id": video_id,

                "video_url":
                    f"https://www.youtube.com/watch?v={video_id}",

                "title":
                    snippet.get(
                        "title",
                        ""
                    ),

                "channel_name":
                    snippet.get(
                        "channelTitle",
                        ""
                    ),

                "published_at":
                    snippet.get(
                        "publishedAt",
                        ""
                    ),

                "thumbnail_url":
                    snippet.get(
                        "thumbnails",
                        {}
                    )
                    .get(
                        "high",
                        {}
                    )
                    .get(
                        "url"
                    )
            })

        print(
            f"YOUTUBE REVIEWS FOUND: "
            f"{len(videos)}"
        )

        return videos

    except requests.exceptions.Timeout:

        print(
            f"YOUTUBE TIMEOUT: "
            f"{query}"
        )

        return []

    except requests.exceptions.RequestException as error:

        print(
            "YOUTUBE REQUEST ERROR:",
            error
        )

        return []

    except Exception as error:

        print(
            "YOUTUBE UNEXPECTED ERROR:",
            error
        )

        return []


    