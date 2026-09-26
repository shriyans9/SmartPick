import os

from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv()


YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")


def search_youtube_reviews(product_name, max_results=5):

    if not YOUTUBE_API_KEY:
        print("YOUTUBE_API_KEY is missing from .env")
        return []

    if not product_name:
        return []

    query = f"{product_name} review"

    try:

        youtube = build(
            "youtube",
            "v3",
            developerKey=YOUTUBE_API_KEY
        )

        response = youtube.search().list(
            part="snippet",
            q=query,
            type="video",
            maxResults=max_results,
            order="relevance",
            regionCode="IN",
            relevanceLanguage="en",
            safeSearch="moderate"
        ).execute()

        videos = []

        for item in response.get("items", []):

            video_id = item.get("id", {}).get("videoId")

            snippet = item.get("snippet", {})

            if not video_id:
                continue

            videos.append({
                "video_id": video_id,

                "title": snippet.get(
                    "title",
                    ""
                ),

                "channel": snippet.get(
                    "channelTitle",
                    ""
                ),

                "published_at": snippet.get(
                    "publishedAt",
                    ""
                ),

                "thumbnail": snippet.get(
                    "thumbnails",
                    {}
                ).get(
                    "medium",
                    {}
                ).get(
                    "url",
                    ""
                ),

                "url": (
                    f"https://www.youtube.com/watch?v={video_id}"
                )
            })

        print(
            f"YOUTUBE: {len(videos)} videos found "
            f"for '{product_name}'"
        )

        return videos

    except Exception as e:

        print(
            "YOUTUBE API ERROR:",
            str(e)
        )

        return []