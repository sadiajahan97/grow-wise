import requests
from django.conf import settings
from .base import BaseFetcher

class VideoFetcher(BaseFetcher):
    def search(self, query, limit=3):
        url = "https://www.googleapis.com/youtube/v3/search"
        params = {
            "part": "snippet",
            "q": query,
            "type": "video",
            "maxResults": limit,
            "key": settings.YOUTUBE_API_KEY
        }

        r = requests.get(url, params=params).json()
        results = []

        for item in r.get("items", []):
            video_id = item["id"]["videoId"]
            results.append({
                "title": item["snippet"]["title"],
                "url": f"https://www.youtube.com/watch?v={video_id}",
                "thumbnail_url": item["snippet"]["thumbnails"]["high"]["url"],
                "source": "youtube",
                "type": "video"
            })

        return results
