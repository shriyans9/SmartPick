from providers.youtube_service import search_youtube_reviews


videos = search_youtube_reviews(
    "Apple iPhone 17 256GB",
    max_results=5
)


print("\n==============================")
print("YOUTUBE REVIEW RESULTS")
print("==============================\n")


for video in videos:

    print("TITLE:", video["title"])
    print("CHANNEL:", video["channel"])
    print("URL:", video["url"])
    print("THUMBNAIL:", video["thumbnail"])
    print("------------------------------")