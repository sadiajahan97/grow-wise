import asyncio
from typing import List

from recommendations.skill_engine import identify_required_skills
from recommendations.agents import (
    video_agent,
    course_agent,
    article_agent,
    custom_agent_creator,
)

async def run_recommendation_pipeline(
    user,
    profession: str,
    chat_history: List[str],
):
    """
    Orchestrates the full recommendation pipeline.

    Flow:
    1. Identify required skills (LLM)
    2. Run recommendation agents in parallel
    3. Persist results to database

    This function is SAFE to call from:
    - Celery task
    - Management command
    - API trigger
    """

    # 1️⃣ Skill Identification
    skills = identify_required_skills(
        user_id=user.id,
        profession=profession,
        chat_history=chat_history,
    )

    if not skills:
        return

    # 2️⃣ Parallel Agent Execution
    await asyncio.gather(
        video_agent(user, skills),
        course_agent(user, skills),
        article_agent(user, skills),
        custom_agent_creator(user, skills),
    )
