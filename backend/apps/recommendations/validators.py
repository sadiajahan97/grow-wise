import requests

def is_valid_url(url: str) -> bool:
    try:
        r = requests.head(url, timeout=5, allow_redirects=True)
        return r.status_code == 200
    except:
        return False
