import re
from google.genai import types
from ..gemini_client import get_gemini_client
from .base import BaseFetcher

ALLOWED_COURSE_DOMAINS = ["coursera.org", "udemy.com", "edx.org"]


class CourseFetcher(BaseFetcher):
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
        
        # Prompt to get structured course information
        prompt = f"""Search for online courses related to the profession: {profession}

Find courses from these platforms: {', '.join(ALLOWED_COURSE_DOMAINS)}

For each course found, provide:
- Title
- URL
- Platform/source

Return the information in a clear format."""

        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=config
            )
            
            # Extract grounding citations to get URLs
            if hasattr(response, 'candidates') and response.candidates:
                candidate = response.candidates[0]
                
                # Get grounding metadata for URLs
                if hasattr(candidate, 'grounding_metadata') and candidate.grounding_metadata:
                    grounding_chunks = candidate.grounding_metadata.grounding_chunks
                    
                    seen_urls = set()
                    for chunk in grounding_chunks:
                        if hasattr(chunk, 'web') and chunk.web:
                            url = chunk.web.uri
                            title = chunk.web.title if hasattr(chunk.web, 'title') else ""
                            
                            # Extract domain from URL
                            source = ""
                            for domain in ALLOWED_COURSE_DOMAINS:
                                if domain in url:
                                    source = domain
                                    break
                            
                            # Only add if from allowed domains and not duplicate
                            if source and url not in seen_urls and len(results) < limit:
                                results.append({
                                    "title": title or "Course",
                                    "url": url,
                                    "source": source,
                                    "type": "course"
                                })
                                seen_urls.add(url)
            
            # If we didn't get enough results from grounding, try to parse the text response
            if len(results) < limit and hasattr(response, 'text') and response.text:
                # Parse text response for additional courses
                text = response.text
                lines = text.split('\n')
                
                for line in lines:
                    if any(domain in line.lower() for domain in ALLOWED_COURSE_DOMAINS):
                        # Try to extract URL from line
                        urls = re.findall(r'https?://[^\s\)]+', line)
                        for url in urls:
                            if url not in seen_urls:
                                source = ""
                                for domain in ALLOWED_COURSE_DOMAINS:
                                    if domain in url:
                                        source = domain
                                        break
                                
                                if source and len(results) < limit:
                                    # Extract title from line (text before URL)
                                    title = line.split(url)[0].strip()
                                    if not title:
                                        title = "Course"
                                    
                                    results.append({
                                        "title": title,
                                        "url": url,
                                        "source": source,
                                        "type": "course"
                                    })
                                    seen_urls.add(url)
                                    if len(results) >= limit:
                                        break
                    
                    if len(results) >= limit:
                        break
        
        except Exception as e:
            # If Gemini fails, return empty results
            print(f"Error fetching courses with Gemini: {str(e)}")
            return []
        
        return results[:limit]
