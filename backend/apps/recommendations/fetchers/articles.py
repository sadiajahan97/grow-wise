import requests
from django.conf import settings
from .base import BaseFetcher

ALLOWED_DOMAINS = [
    "medium.com",
    "martinfowler.com",
    "developer.mozilla.org"
]

class ArticleFetcher(BaseFetcher):
    def search(self, query, limit=3):
        # MVP: Google Custom Search (domain-restricted)
        results = []

        for domain in ALLOWED_DOMAINS:
            url = f"https://www.googleapis.com/customsearch/v1"
            params = {
                "q": f"{query} site:{domain}",
                "key": settings.GOOGLE_API_KEY,
                "cx": settings.GOOGLE_SEARCH_ENGINE_ID
            }

            r = requests.get(url, params=params).json()
            for item in r.get("items", [])[:limit]:
                results.append({
                    "title": item["title"],
                    "url": item["link"],
                    "source": domain,
                    "type": "article"
                })

        return results
