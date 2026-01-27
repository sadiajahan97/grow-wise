import os
from google import genai

# Initialize Gemini client
_api_key = os.getenv('GEMINI_API_KEY')
_client = None
if _api_key:
    _client = genai.Client(api_key=_api_key)


def get_gemini_client():
    """
    Get the initialized Gemini client.
    
    Returns:
        genai.Client: The initialized Gemini client
    
    Raises:
        ValueError: If the client is not initialized (GEMINI_API_KEY not set)
    """
    if _client is None:
        raise ValueError("Gemini client not initialized. Please ensure GEMINI_API_KEY is set.")
    return _client

