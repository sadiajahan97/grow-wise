import os
import google.generativeai as genai
from typing import List, Dict


def get_gemini_response(chat_history: List[Dict[str, str]], user_message: str) -> str:
    """
    Get a response from Gemini 2.5 Flash model.
    
    Args:
        chat_history: List of previous messages in format [{"role": "user", "content": "..."}, ...]
        user_message: The current user message
    
    Returns:
        The AI assistant's response
    """
    # Configure Gemini API
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables")
    
    genai.configure(api_key=api_key)
    
    # Initialize the model (Gemini 2.5 Flash)
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    # Build conversation history in the format expected by Gemini
    history = []
    for msg in chat_history:
        role = "user" if msg["role"] == "user" else "model"
        history.append({
            "role": role,
            "parts": [msg["content"]]
        })
    
    # Start chat with history
    chat = model.start_chat(history=history)
    
    # Send the current user message and get response
    try:
        response = chat.send_message(user_message)
        return response.text
    except Exception as e:
        raise Exception(f"Error calling Gemini API: {str(e)}")

