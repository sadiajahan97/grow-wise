import re
from urllib.parse import urlparse
from google.genai import types
from ..gemini_client import get_gemini_client
from .base import BaseFetcher


class ArticleFetcher(BaseFetcher):
    def search(self, profession, limit=5):
        client = get_gemini_client()
        results = []
        
        # Configure grounding tool with Google Search
        grounding_tool = types.Tool(
            google_search=types.GoogleSearch()
        )
        
        config = types.GenerateContentConfig(
            tools=[grounding_tool],
            temperature=0.7
        )
        
        # Prompt to get structured article information
        prompt = f"""Search for articles and blog posts related to the profession: {profession}

For each article found, provide:
- Title
- URL
- Source/domain

Return the information in a clear format."""

        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=config
            )
            
            seen_urls = set()
            
            # Extract grounding citations to get URLs
            if hasattr(response, 'candidates') and response.candidates:
                candidate = response.candidates[0]
                
                # Get grounding metadata for URLs
                if hasattr(candidate, 'grounding_metadata') and candidate.grounding_metadata:
                    grounding_chunks = candidate.grounding_metadata.grounding_chunks
                    
                    for chunk in grounding_chunks:
                        if hasattr(chunk, 'web') and chunk.web:
                            url = chunk.web.uri
                            title = chunk.web.title if hasattr(chunk.web, 'title') else ""
                            
                            # Extract domain from URL as source
                            try:
                                from urllib.parse import urlparse
                                parsed_url = urlparse(url)
                                source = parsed_url.netloc.replace('www.', '')
                            except:
                                source = ""
                            
                            # Only add if not duplicate and within limit
                            if url not in seen_urls and len(results) < limit:
                                results.append({
                                    "title": title or "Article",
                                    "url": url,
                                    "source": source,
                                    "type": "article"
                                })
                                seen_urls.add(url)
            
            # If we didn't get enough results from grounding, try to parse the text response
            if len(results) < limit and hasattr(response, 'text') and response.text:
                # Parse text response for additional articles
                text = response.text
                lines = text.split('\n')
                
                for line in lines:
                    # Try to extract URL from line
                    urls = re.findall(r'https?://[^\s\)]+', line)
                    for url in urls:
                        if url not in seen_urls and len(results) < limit:
                            # Extract title from line (text before URL)
                            title = line.split(url)[0].strip()
                            if not title:
                                title = "Article"
                            
                            # Extract domain from URL as source
                            try:
                                from urllib.parse import urlparse
                                parsed_url = urlparse(url)
                                source = parsed_url.netloc.replace('www.', '')
                            except:
                                source = ""
                            
                            results.append({
                                "title": title,
                                "url": url,
                                "source": source,
                                "type": "article"
                            })
                            seen_urls.add(url)
                            if len(results) >= limit:
                                break
                    
                    if len(results) >= limit:
                        break
        
        except Exception as e:
            # If Gemini fails, return empty results
            print(f"Error fetching articles with Gemini: {str(e)}")
            return []
        
        return results[:limit]
