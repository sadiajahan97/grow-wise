# apps/recommendations/agents/article_agent.py
import asyncio
from asgiref.sync import sync_to_async
from typing import List
from apps.recommendations_01.models import ArticleRecommendation
from apps.recommendations_01.agents.llm_client import gemini_google_search
from apps.recommendations_01.agents.prompts import ARTICLE_SYSTEM_PROMPT


@sync_to_async
def save_article(user, item):
    return ArticleRecommendation.objects.create(
        user=user,
        skill=item.get("topic"),
        title=item.get("title"),
        description=item.get("description"),
        url=item.get("url"),
        source=item.get("source"),
    )



# ==================================================
async def article_agent(
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

    ARTICLE_SYSTEM_PROMPT = f"""
You are an expert AI learning recommendation agent designed for users
from ANY profession or background.

You curate high-quality reading materials that help people learn,
upskill, or think better in their professional and personal lives.

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
3. Search for high-quality online articles based on the inferred topics using the Google Search tool.
4. Return a JSON list of **UP TO 10** verified recommendations.

CONTENT SELECTION RULES
-----------------------
- Results must be ARTICLES only (text-based)
- NO videos, podcasts, reels, shorts, or social media posts
- Avoid clickbait, listicles, or shallow content
- Avoid spammy or SEO-farmed websites

CRITICAL: ZERO TOLERANCE URL POLICY
-----------------------------------
1. **LITERAL EXTRACTION:** You must copy the URL *exactly* as it appears in the Google Search tool output.
2. **NO CONSTRUCTION:** Never "build" a URL by combining parts or guessing.
3. **OMISSION RULE:** If the search result does not contain a clickable, valid `https://` URL to the specific article, **DISCARD THAT ITEM ENTIRELY**.
   - It is better to return 2 valid articles than 5 articles with 1 bad link.
   - Do not hallucinate a link to fill the list.

PLATFORM QUALITY GUIDELINES
---------------------------
Select articles ONLY from credible, high-quality platforms such as:
- Official documentation or knowledge bases
- Reputable publications (Harvard Business Review, MIT Technology Review,
  McKinsey Insights, Nature, The Economist, Wired, The Atlantic)
- Well-known learning platforms (Coursera Blog, Google AI Blog,
  AWS Architecture Blog, Microsoft Learn, OpenAI Blog)
- Established professional blogs and magazines relevant to the profession
- Recognized experts or institutions

DIFFICULTY ADAPTATION
---------------------
- Match article depth to the user's background
- If user is non-technical, prefer conceptual and applied explanations
- If user is advanced, prefer deep, analytical, or research-based content

RANKING CRITERIA
----------------
Rank results by:
1. Relevance to the user's profession and interests
2. Practical or intellectual value
3. Credibility of the source
4. Clarity and structure

OUTPUT FORMAT (STRICT)
----------------------
Return ONLY valid JSON:

[
  {{
    "topic": "",
    "title": "",
    "description": "",
    "url": "",
    "source": ""
  }}
]

Do NOT include explanations, markdown, commentary, or extra text.
"""

    # results = gemini_google_search(system_prompt=ARTICLE_SYSTEM_PROMPT)
    
    print("\n\n\nArticle Agent Invoking Gemini Google Search...\n\n\n")
    print(f"System Prompt:\n{ARTICLE_SYSTEM_PROMPT}\n\n\n")
    results = await asyncio.to_thread(
        gemini_google_search,
        ARTICLE_SYSTEM_PROMPT
    )
    
    print("\n\n\nArticle Agent Gemini Search Completed.\n\n\n")
    print(f"Results: {results}\n\n\n=========================")

    # Handle empty or None results
    if not results:
        print("Warning: No results returned from article agent")
        return []
    
    # Ensure results is a list
    if not isinstance(results, list):
        print(f"Warning: Results is not a list, got {type(results)}")
        return []

    for item in results:
        try:
            await save_article(user, item)
        except Exception as e:
            print(f"Error saving article recommendation: {e}")
            print(f"Item: {item}")
            # Continue with other items even if one fails

    # print(f"\n\n\nArticle Agent Response: {results}")

    # for item in results:
    #     ArticleRecommendation.objects.create(
    #         user=user,
    #         skill=item.get("topic"),  # inferred topic
    #         title=item.get("title"),
    #         description=item.get("description"),
    #         url=item.get("url"),
    #         source=item.get("source"),
    #     )
    return results