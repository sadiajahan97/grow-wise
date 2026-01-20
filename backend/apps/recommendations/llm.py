import json
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# def call_llm(prompt: str) -> str:
#     response = client.chat.completions.create(
#     model="gpt-4o-mini",
#     messages=[
#         {"role": "system", "content": "You are a helpful recommendation engine."},
#         {"role": "user", "content": prompt}
#     ],
#     temperature=0.7
#     )
    
#     return response.choices[0].message.content


# Intent prompt
INTENT_PROMPT = """
You are a career learning expert.

Given the current role and next role job descriptions,
identify learning intents.

Return STRICT JSON only.

Schema:
{
  "learning_intents": [
    {
      "skill": "...",
      "priority": "high | medium | low",
      "search_queries": {
        "article": "...",
        "video": "...",
        "course": "..."
      },
      "reason": "..."
    }
  ]
}
"""


# extracting learning intents
def extract_learning_intents(context: str) -> dict:
    response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": INTENT_PROMPT},
        {"role": "user", "content": context}
    ],
    temperature=0.2
    )
    
    return json.loads(response.choices[0].message.content)