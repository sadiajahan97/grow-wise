import requests
from django.conf import settings
from .base import BaseFetcher

ALLOWED_COURSE_DOMAINS = ["coursera.org", "udemy.com", "edx.org"]

class CourseFetcher(BaseFetcher):
    def search(self, query, limit=3):
        results = []

        for domain in ALLOWED_COURSE_DOMAINS:
            url = "https://www.googleapis.com/customsearch/v1"
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
                    "type": "course"
                })

        return results
