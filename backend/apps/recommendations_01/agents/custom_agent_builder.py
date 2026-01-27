# apps/recommendations/agents/custom_agent.py
import asyncio
from asgiref.sync import sync_to_async
from typing import List
from apps.recommendations_01.models import AgentRecommendation
from apps.recommendations_01.agents.llm_client import generate_future_agent_prompts



@sync_to_async
def save_custom_agents(user, item):
    return AgentRecommendation.objects.create(
        user=user,
        skill=item.get("Skills"),
        name=item.get("Name"),
        system_prompt=item.get("System_prompt"),
    )

# ==================================================
async def custom_agent_builder(
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

    SYSTEM_PROMPT = """
    You are an expert AI architect and specialized agent designer.

Your task is to design FUTURE SPECIALIZED AI AGENTS for a user based on
their profession and previous questions.

USER CONTEXT
------------
Profession:
{profession}

Previous Question History:
{question_history}

YOUR OBJECTIVES
---------------
1. Analyze the user's profession and question history.
2. Identify the MOST IMPORTANT topics, skills, or subject areas that are:
   - Highly relevant to the user's profession
   - Frequently implied or explicitly asked about in the question history
   - Valuable for the user's growth, productivity, or decision-making
3. If the question history is empty or minimal, infer learning needs
   primarily from the profession.

AGENT GENERATION REQUIREMENT
----------------------------
- You MUST generate BETWEEN 5 AND 10 future specialized agents.
- Do NOT generate fewer than 5 or more than 10 agents.
- Each agent must cover a DISTINCT and NON-OVERLAPPING specialization.

AGENT DESIGN RULES (CRITICAL)
-----------------------------
For EACH identified topic or skill, design ONE FUTURE SPECIALIZED AI AGENT.

Each future agent MUST:
- Be STRICTLY LIMITED to ONE specialized domain or skill
- Perform tasks ONLY within its specialized area
- Politely but FIRMLY refuse to answer questions outside its scope
- Clearly state its specialization when refusing
- Never attempt to partially answer out-of-scope questions

SYSTEM PROMPT DESIGN REQUIREMENTS
---------------------------------
Each generated system prompt must:
- Clearly define the agent’s specialization
- Explicitly list what the agent CAN do
- Explicitly list what the agent MUST NOT do
- Enforce strict domain boundaries at all times
- Use consistent refusal language for out-of-scope questions

REFUSAL BEHAVIOR (MANDATORY)
----------------------------
When a question is outside the agent’s specialization, the agent MUST reply:
"Sorry, I can only help with <specialization>. This question is outside my scope."

OUTPUT FORMAT (STRICT)
----------------------
Return ONLY valid JSON in the following format:

[
  {
    "Skills": "<single, clearly defined skill or domain>",
    "Name": "<short, descriptive agent name (e.g., ExcelAI, FinanceAnalysisAI)>",
    "System_prompt": "<complete, production-ready system prompt for this specialized agent>"
  }
]

IMPORTANT CONSTRAINTS
---------------------
- Generate BETWEEN 5 AND 10 agents ONLY
- Name each agent uniquely and descriptively
- Name must reflect the specialization clearly and simple and small
- Do NOT include explanations, commentary, or markdown
- Do NOT create generic or multi-domain agents
- Do NOT create overlapping agents
- Each agent must have a clearly distinct and enforceable specialization
- System prompts must be ready to be used directly in production
"""

    
    print("\n\n\nCustom Agent Builder Invoking LLM Client...\n\n\n")
    print(f"System Prompt:\n{SYSTEM_PROMPT}\n\n\n===========")
    
    results = await asyncio.to_thread(
        generate_future_agent_prompts,
        SYSTEM_PROMPT
    )
    
    print("\n\n\nCustom Agent building Completed.\n\n\n")
    print(f"Results: {results}\n\n\n=========================")

    for item in results:
        await save_custom_agents(user, item)

    return results
