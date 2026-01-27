import re
from google.genai import types
from ..gemini_client import get_gemini_client
from .base import BaseFetcher


class VideoFetcher(BaseFetcher):
    def search(self, profession, limit=3):
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
        
        # Prompt to get structured video information
        prompt = f"""Search for YouTube videos related to the profession: {profession}

For each video found, provide:
- Title
- URL (YouTube video link)
- Thumbnail URL if available

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
                            
                            # Only add YouTube videos
                            if "youtube.com" in url or "youtu.be" in url:
                                if url not in seen_urls and len(results) < limit:
                                    # Extract video ID for thumbnail
                                    video_id = self._extract_video_id(url)
                                    thumbnail_url = f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg" if video_id else ""
                                    
                                    results.append({
                                        "title": title or "Video",
                                        "url": url,
                                        "thumbnail_url": thumbnail_url,
                                        "source": "youtube",
                                        "type": "video"
                                    })
                                    seen_urls.add(url)
            
            # If we didn't get enough results from grounding, try to parse the text response
            if len(results) < limit and hasattr(response, 'text') and response.text:
                # Parse text response for additional videos
                text = response.text
                lines = text.split('\n')
                
                for line in lines:
                    if "youtube.com" in line.lower() or "youtu.be" in line.lower():
                        # Try to extract URL from line
                        urls = re.findall(r'https?://[^\s\)]+', line)
                        for url in urls:
                            if ("youtube.com" in url or "youtu.be" in url) and url not in seen_urls:
                                if len(results) < limit:
                                    # Extract title from line (text before URL)
                                    title = line.split(url)[0].strip()
                                    if not title:
                                        title = "Video"
                                    
                                    # Extract video ID for thumbnail
                                    video_id = self._extract_video_id(url)
                                    thumbnail_url = f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg" if video_id else ""
                                    
                                    results.append({
                                        "title": title,
                                        "url": url,
                                        "thumbnail_url": thumbnail_url,
                                        "source": "youtube",
                                        "type": "video"
                                    })
                                    seen_urls.add(url)
                                    if len(results) >= limit:
                                        break
                    
                    if len(results) >= limit:
                        break
        
        except Exception as e:
            # If Gemini fails, return empty results
            print(f"Error fetching videos with Gemini: {str(e)}")
            return []
        
        return results[:limit]
    
    def _extract_video_id(self, url: str) -> str:
        """Extract YouTube video ID from URL"""
        # Handle different YouTube URL formats
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})',
            r'youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        return ""
