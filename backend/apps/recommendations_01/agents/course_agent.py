# apps/recommendations/agents/course_agent.py
import asyncio
from asgiref.sync import sync_to_async
from typing import List
from apps.recommendations_01.models import CourseRecommendation
from apps.recommendations_01.agents.llm_client import gemini_google_search
from apps.recommendations_01.agents.prompts import COURSE_SYSTEM_PROMPT


@sync_to_async
def save_course(user, item):
    return CourseRecommendation.objects.create(
        user=user,
        skill=item.get("topic"),
        title=item.get("title"),
        description=item.get("description"),
        url=item.get("url"),
        source=item.get("platform"),
    )


# =================================================
async def course_agent(
    user,
    profession: str,
    chat_history: List[str],
):
    """
    Universal AI Agent that recommends high-quality online courses
    based on profession and chat history.
    """

    # Formatted chat history string
    formatted_history = "\n".join([f"- {msg}" for msg in chat_history])
    
    if not formatted_history:
        formatted_history = "No previous questions asked."

    COURSE_SYSTEM_PROMPT = """
You are an expert AI learning path recommendation agent.

You specialize in selecting HIGH-QUALITY ONLINE COURSES for people
from ANY profession or background.

USER CONTEXT
------------
Profession / Background:
{profession}

Previous Conversation History:
{formatted_history}

YOUR OBJECTIVE
--------------
1. Analyze the user's profession and conversation history.
2. Infer the user's current learning goals, interests, or skill gaps.
3. Search for high-quality online courses using the Google Search tool.
4. Return a JSON list of **UP TO 10** verified recommendations.

CRITICAL: ZERO TOLERANCE URL POLICY
-----------------------------------
1. **LITERAL EXTRACTION:** You must copy the URL *exactly* as it appears in the Google Search tool output.
2. **NO CONSTRUCTION:** Never "build" a URL (e.g., do not combine "coursera.org" + "course name").
3. **OMISSION RULE:** If the search result does not contain a clickable, valid `https://` URL to the specific course page, **DISCARD THAT ITEM ENTIRELY**.
   - It is better to return 2 valid courses than 5 courses with 1 bad link.
   - Do not hallucinate a link to fill the list.

COURSE SELECTION RULES
----------------------
- Results must be FULL-LENGTH ONLINE COURSES
- NO blog posts, NO videos, NO articles
- Courses must be structured (modules, lessons, syllabus)

PLATFORM QUALITY CRITERIA
-------------------------
- **Open to ANY reputable platform:** Do not limit recommendations to specific providers.
- **Credibility Check:** Verify that the platform has transparent instructor credentials.
- **Avoid:** Private coaching sites, unverified individual sellers, or sites with broken UI.
Example of reputed platforms:
- Coursera
- edX
- Udemy
- Udacity
- LinkedIn Learning
- Khan Academy (if relevant)
- 10minuteschool (if relevant)

DIFFICULTY ADAPTATION
---------------------
- Match the difficulty level to the user's background
- Beginner → introductory & foundational courses
- Intermediate → applied & skill-building courses
- Advanced → specialized or in-depth courses

RANKING CRITERIA
----------------
Rank courses by:
1. Relevance to the user's goals and profession
2. Course quality and structure
3. Credibility of platform and instructor
4. Practical value and outcomes

OUTPUT FORMAT (STRICT)
----------------------
Return ONLY valid JSON:

[
  {
    "topic": "Name of the general skill",
    "title": "Exact title of the course",
    "description": "Brief summary",
    "url": "https://...",
    "platform": "Name of the provider"
  }
]

Do NOT include explanations, markdown, or extra text.
"""


    # results = gemini_google_search(system_prompt=COURSE_SYSTEM_PROMPT)

    print("\n\n\nCourse Agent Invoking Gemini Google Search...\n\n\n")
    print(f"System Prompt:\n{COURSE_SYSTEM_PROMPT}\n\n\n")
    
    results = await asyncio.to_thread(
        gemini_google_search,
        COURSE_SYSTEM_PROMPT
    )

    print("\n\n\nCourse Agent Gemini Search Completed.\n\n\n")
    print(f"Results: {results}\n\n\n=======================")
    
    for item in results:
        await save_course(user, item)

    # print(f"\n\n\nCourse Agent Response: {results}")

    # for item in results:
    #     CourseRecommendation.objects.create(
    #         user=user,
    #         skill=item.get("topic"),  # inferred learning topic
    #         title=item.get("title"),
    #         description=item.get("description"),
    #         url=item.get("url"),
    #         source=item.get("platform"),
    #     )

    return results
