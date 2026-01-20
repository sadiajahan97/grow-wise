# thumbnails.py

import requests
from bs4 import BeautifulSoup

def extract_og_thumbnail(url):
    try:
        response = requests.get(url, timeout=5)
        soup = BeautifulSoup(response.text, "html.parser")
        tag = soup.find("meta", property="og:image")
        if tag:
            return tag.get("content")
    except Exception:
        pass
    return None
