from http import client
import json
import sys
from typing import List, Dict

from google import genai



GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025"


client = genai.Client()



# =============================
# TEXT EXTRACTION & CLEANING
# ==========================
def extract_text_from_gemini(response) -> str:
    return response.candidates[0].content.parts[0].text

import re

def strip_code_fences(text: str) -> str:
    """
    Removes ```json ... ``` or ``` ... ``` wrappers
    """
    text = text.strip()

    # Remove opening fence
    text = re.sub(r"^```(?:json)?\s*", "", text)

    # Remove closing fence
    text = re.sub(r"\s*```$", "", text)

    return text.strip()

# =============================
# JSON PARSING FUNCTION
# ===========================
def parse_gemini_json(text: str):
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON from Gemini: {e}")
    
# ============================
# URL PATCHING FUNCTION
# =========================== 
def patch_urls_from_metadata(parsed_items: list, response) -> list:
    """
    Overwrites the 'url' field in the parsed JSON with the VALID urls 
    found in the Gemini grounding metadata.
    """
    if not response.candidates:
        return parsed_items

    if not hasattr(response.candidates[0], 'grounding_metadata'):
        return parsed_items

    metadata = response.candidates[0].grounding_metadata

    if not metadata.grounding_chunks:
        return parsed_items

    chunks = getattr(metadata, "grounding_chunks", None)
    if not chunks:
        return parsed_items

    # Filter for chunks that have a Web URI
    valid_web_chunks = [c.web for c in chunks if c.web and c.web.uri]
    if not valid_web_chunks:
        return parsed_items
    
    # Patch the JSON items
    for i, item in enumerate(parsed_items):
        if i < len(valid_web_chunks):
            real_url = valid_web_chunks[i].uri            
            item['url'] = real_url
            item['source'] = valid_web_chunks[i].title
        else:
            print(f"Warning: Item {i} ('{item.get('title')}') has no matching verified URL.")

    return parsed_items
    

# ==================================================
# Agent - gemini with Google Search tool
# ==================================================
def gemini_google_search(
    system_prompt: str,
) -> List[Dict]:
    """
    Uses Gemini 2.5 Flash with Google Search tool to get recommendations.
    """
    
    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=system_prompt,
        config={
                "tools": [{"google_search": {}}],
                }
    )
    
    # Extract and clean text
    raw_text = extract_text_from_gemini(response)
    clean_text = strip_code_fences(raw_text)
    
    # Parse JSON
    parsed_json = parse_gemini_json(clean_text)
    
    print(f"\n======\nParsed JSON:\n{parsed_json}\n====\n")
    # Patch URLs from grounding metadata
    parsed_json = patch_urls_from_metadata(parsed_json, response)
    

    return parsed_json 
    
    
    
    