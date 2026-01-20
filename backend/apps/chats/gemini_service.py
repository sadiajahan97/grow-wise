import os
import google.generativeai as genai
from typing import List, Dict, Optional


def get_gemini_response(
    chat_history: List[Dict[str, str]], 
    user_message: str,
    user_info: Optional[Dict[str, str]] = None
) -> str:
    """
    Get a response from Gemini 2.5 Flash model.
    
    Args:
        chat_history: List of previous messages in format [{"role": "user", "content": "..."}, ...]
        user_message: The current user message
        user_info: Optional dictionary containing user information (name, staff_id, department_name, designation_name)
    
    Returns:
        The AI assistant's response
    """
    # Configure Gemini API
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables")
    
    genai.configure(api_key=api_key)
    
    # Build system instruction with user information
    system_instruction = None
    if user_info:
        context_parts = []
        if user_info.get('name'):
            context_parts.append(f"Name: {user_info['name']}")
        if user_info.get('staff_id'):
            context_parts.append(f"Staff ID: {user_info['staff_id']}")
        if user_info.get('department_name'):
            context_parts.append(f"Department: {user_info['department_name']}")
        if user_info.get('designation_name'):
            context_parts.append(f"Designation: {user_info['designation_name']}")
        
        if context_parts:
            system_instruction = (
                "You are an internal AI assistant for GrowWise, a personal growth and development platform. "
                "You have been explicitly provided with the following user profile information:\n\n" + 
                "\n".join(context_parts) + 
                "\n\nCRITICAL INSTRUCTIONS:\n"
                "- You HAVE ACCESS to this user information and MUST use it when relevant.\n"
                "- When the user asks about their staff ID, name, department, or designation, you MUST provide this information directly.\n"
                "- Do NOT say you don't have access to this information - you have been explicitly provided with it in this conversation.\n"
                "- This is an internal company application, and you are authorized to share this user's own information with them.\n"
                "- Use this information to provide personalized and context-aware assistance."
            )
    
    # Initialize the model with system instruction if available
    # Try using system_instruction parameter (available in newer versions)
    use_system_instruction = False
    if system_instruction:
        try:
            model = genai.GenerativeModel(
                'gemini-2.5-flash',
                system_instruction=system_instruction
            )
            use_system_instruction = True
        except (TypeError, AttributeError):
            # Fallback if system_instruction parameter is not supported
            model = genai.GenerativeModel('gemini-2.5-flash')
            use_system_instruction = False
    else:
        model = genai.GenerativeModel('gemini-2.5-flash')
    
    # Build conversation history in the format expected by Gemini
    history = []
    
    # Add system context to history if system_instruction parameter wasn't used
    # Only add for new chats to avoid repeating the context
    if system_instruction and not use_system_instruction and len(chat_history) == 0:
        history.append({
            "role": "user",
            "parts": [system_instruction]
        })
        history.append({
            "role": "model",
            "parts": ["I understand. I have access to your profile information and will use it to provide personalized assistance. How can I help you today?"]
        })
    
    # Add previous chat history
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

