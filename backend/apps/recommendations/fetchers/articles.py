import requests
from django.conf import settings
from .base import BaseFetcher


class ArticleFetcher(BaseFetcher):
    def search(self, query, limit=5):
        url = "https://www.googleapis.com/customsearch/v1"

        params = {
            "q": query,
            "key": settings.GOOGLE_API_KEY,
            "cx": settings.GOOGLE_SEARCH_ENGINE_ID,
            "num": limit
        }

        r = requests.get(url, params=params).json()

        results = []
        for item in r.get("items", []):
            results.append({
                "title": item.get("title"),
                "url": item.get("link"),
                "source": item.get("displayLink"),
                "type": "article"
            })

        return results
