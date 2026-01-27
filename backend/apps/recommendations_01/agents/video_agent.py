# apps/recommendations/agents/video_agent.py
import asyncio
from asgiref.sync import sync_to_async
from typing import List
from apps.recommendations_01.models import VideoRecommendation
from apps.recommendations_01.agents.llm_client import gemini_google_search
from apps.recommendations_01.agents.prompts import VIDEO_SYSTEM_PROMPT


# 
@sync_to_async
def save_video(user, item):
    return VideoRecommendation.objects.create(
        user=user,
        skill=item.get("topic"),
        title=item.get("title"),
        description=item.get("description"),
        url=item.get("url"),
        source=item.get("source", "YouTube"),
    )
    
    
#  =================================================
async def video_agent(
    user,
    profession: str,
    chat_history: List[str],
):
    """
    AI Agent that infers topics and recommends videos automatically.
    """
    
    # Formatted chat history string
    formatted_history = "\n".join([f"- {msg}" for msg in chat_history])
    
    if not formatted_history:
        formatted_history = "No previous questions asked."

    system_prompt = f"""
You are an expert AI learning recommendation agent.

You specialize in selecting HIGH-QUALITY YOUTUBE VIDEOS for people
based on profession and conversation history.

USER CONTEXT
------------
Profession:
{profession}

Previous Conversation History:
{formatted_history}

YOUR TASK
---------
1. Analyze the user's profession and conversation history.
2. Infer the user's current learning goals, interests, or skill gaps.
3. Search for high-quality youtube videos using the Google Search tool.
4. Return a JSON list of **UP TO 10** verified recommendations.

CRITICAL: ZERO TOLERANCE URL POLICY
-----------------------------------
1. **LITERAL EXTRACTION:** You must copy the URL *exactly* as it appears in the Google Search tool output.
2. **NO CONSTRUCTION:** Never "build" a URL by combining parts or guessing.
3. **OMISSION RULE:** If the search result does not contain a clickable, valid `https://` URL to the specific video, **DISCARD THAT ITEM ENTIRELY**.
   - It is better to return 2 valid videos than 5 videos with 1 bad link.
   - Do not hallucinate a link to fill the list.

SEARCH & RANKING RULES
---------------------
- Results must be VIDEOS only
- videos must be from YouTube only
- Rank by:
  1. Practical usefulness
  2. Clarity
  3. Relevance to the user's profession

DIFFICULTY ADAPTATION
---------------------
- Match the difficulty level to the user's background
- Beginner → introductory & foundational videos
- Intermediate → applied & skill-building videos
- Advanced → specialized or in-depth videos

OUTPUT FORMAT (STRICT)
----------------------
Return ONLY valid JSON:

[
  {{
    "topic": "Name of the general skill",
    "title": "Exact title of the video",
    "description": "Brief summary",
    "url": "https://...",
    "source": "YouTube"
  }}
]

Do NOT include explanations or extra text.
"""
    # results = gemini_google_search(system_prompt=system_prompt)
    
    print("\n\n\nVideo Agent Invoking Gemini Google Search...\n\n\n")
    print(f"System Prompt:\n{system_prompt}\n\n\n")
    
    
    results = await asyncio.to_thread(
        gemini_google_search,
        system_prompt
    )

    print("\n\n\nVideo Agent Gemini Search Completed.\n\n\n")
    print(f"Results: {results}\n\n\n=========================")
    
    # Handle empty or None results
    if not results:
        print("Warning: No results returned from video agent")
        return []
    
    # Ensure results is a list
    if not isinstance(results, list):
        print(f"Warning: Results is not a list, got {type(results)}")
        return []
    
    for item in results:
        try:
            await save_video(user, item)
        except Exception as e:
            print(f"Error saving video recommendation: {e}")
            print(f"Item: {item}")
            # Continue with other items even if one fails
        
    return results