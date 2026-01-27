# apps/recommendations/agents/custom_agent.py

from typing import List
from apps.recommendations_01.models import AgentRecommendation


async def custom_agent_creator(user, skills: List[str]):
    for skill in skills:
        system_prompt = f"""
You are an expert AI tutor specialized in {skill}.

Responsibilities:
- Explain core concepts clearly
- Provide real-world examples
- Suggest exercises and best practices
- Answer questions step-by-step
"""

        AgentRecommendation.objects.create(
            user=user,
            skill=skill,
            name=f"{skill} Learning Agent",
            system_prompt=system_prompt.strip(),
        )
