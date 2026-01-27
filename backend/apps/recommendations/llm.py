import json
from typing import List, Dict
from google.genai import types
from .gemini_client import get_gemini_client

# Agent suggestion prompt
AGENT_PROMPT = """
You are an expert in creating AI agents for professional development.

Given a profession, suggest relevant AI agent names and their system prompts.
Each agent should be specialized for a specific aspect of professional development related to that profession.

Return STRICT JSON only.

Schema:
{
  "agents": [
    {
      "name": "agent name",
      "system_prompt": "detailed system prompt for this agent"
    }
  ]
}
"""


def suggest_agents(profession: str) -> List[Dict[str, str]]:
    """
    Suggest agent names with their system prompts based on profession.
    
    Args:
        profession: The profession name
        
    Returns:
        List of dictionaries with 'agent' and 'system_prompt' keys
    """
    client = get_gemini_client()
    
    prompt = f"{AGENT_PROMPT}\n\nProfession: {profession}"
    
    config = types.GenerateContentConfig(
        temperature=0.7
    )
    
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=config
    )
    
    try:
        content = response.text.strip()
        result = json.loads(content)
        return result.get("agents", [])
    except json.JSONDecodeError:
        content = response.text.strip()
        # Try to extract JSON from markdown code blocks
        if '```json' in content:
            start = content.find('```json') + 7
            end = content.find('```', start)
            content = content[start:end].strip()
        elif '```' in content:
            start = content.find('```') + 3
            end = content.find('```', start)
            content = content[start:end].strip()
        
        try:
            result = json.loads(content)
            return result.get("agents", [])
        except json.JSONDecodeError:
            raise ValueError(f"Failed to parse JSON response from Gemini: {response.text}")


# Recommendation summary prompt
RECOMMENDATION_SUMMARY_PROMPT = """
You are a professional development expert.

Given a list of recommended learning resources (articles, videos, courses) for a specific profession,
write a brief summary (2-3 sentences) explaining why these resources are recommended together.

Focus on how these resources collectively support professional development in the given profession.

Return STRICT JSON only.

Schema:
{
  "summary": "brief explanation of why these resources are recommended"
}
"""


def generate_recommendation_reasons(recommendations: List, profession: str) -> str:
    """
    Generate a brief summary explaining why the recommended resources are relevant.
    
    Args:
        recommendations: List of Recommendation objects (or dicts with title, content_type, url)
        profession: The profession name
        
    Returns:
        A single brief summary string explaining why these resources are recommended
    """
    client = get_gemini_client()
    
    # Format recommendations for the prompt
    resources_list = []
    for rec in recommendations:
        # Handle both model instances and dicts
        if hasattr(rec, 'title'):
            title = rec.title
            content_type = rec.content_type
        else:
            title = rec.get('title', '')
            content_type = rec.get('content_type', '')
        
        resources_list.append(f"- {content_type.title()}: {title}")
    
    resources_text = "\n".join(resources_list)
    
    prompt = f"""{RECOMMENDATION_SUMMARY_PROMPT}

Profession: {profession}

Resources:
{resources_text}
"""
    
    config = types.GenerateContentConfig(
        temperature=0.5
    )
    
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=config
    )
    
    try:
        content = response.text.strip()
        result = json.loads(content)
        return result.get("summary", "These resources are recommended for professional development.")
    except json.JSONDecodeError:
        content = response.text.strip()
        # Try to extract JSON from markdown code blocks
        if '```json' in content:
            start = content.find('```json') + 7
            end = content.find('```', start)
            content = content[start:end].strip()
        elif '```' in content:
            start = content.find('```') + 3
            end = content.find('```', start)
            content = content[start:end].strip()
        
        try:
            result = json.loads(content)
            return result.get("summary", "These resources are recommended for professional development.")
        except json.JSONDecodeError:
            # Fallback: return generic summary
            return "These resources are recommended for professional development."