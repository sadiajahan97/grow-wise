from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound
from apps.chats.models import Chat, Message
from apps.chats.serializers import ChatSerializer, ChatCreateSerializer, MessageSerializer, MessageCreateSerializer
from apps.chats.gemini_service import get_gemini_response
from apps.employees.models import Employee


class ChatListView(generics.ListCreateAPIView):
    """
    API endpoint to list all chats for the authenticated employee or create a new chat.
    
    GET /api/employees/chats/ - Returns chats for the authenticated employee
    POST /api/employees/chats/ - Creates a new chat for the authenticated employee
    
    POST Request Body:
    {
        "name": "My New Chat"
    }
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ChatCreateSerializer
        return ChatSerializer

    def get_queryset(self):
        # Get the employee from the authenticated user
        user = self.request.user
        try:
            employee = user.employee
            # Return chats in descending order of created_at (newest first)
            return Chat.objects.filter(employee=employee).order_by('-created_at')
        except Employee.DoesNotExist:
            return Chat.objects.none()

    def perform_create(self, serializer):
        # Get the employee from the authenticated user
        user = self.request.user
        try:
            employee = user.employee
        except Employee.DoesNotExist:
            raise NotFound("Employee profile not found for this user.")
        
        # Create the chat with the authenticated employee
        serializer.save(employee=employee)
    
    def create(self, request, *args, **kwargs):
        """Override create to return full chat object with ChatSerializer"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return the created chat using ChatSerializer
        chat = serializer.instance
        response_serializer = ChatSerializer(chat)
        headers = self.get_success_headers(response_serializer.data)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class MessageListView(generics.ListCreateAPIView):
    """
    API endpoint to list all messages for a specific chat or create a new message.
    Only returns/creates messages for chats belonging to the authenticated employee.
    
    GET /api/employees/chats/{chat_id}/messages/ - Returns messages for the specified chat
    POST /api/employees/chats/{chat_id}/messages/ - Creates a new message in the specified chat
    
    POST Request Body:
    {
        "content": "Hello, how can I help you?"
    }
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MessageCreateSerializer
        return MessageSerializer

    def get_queryset(self):
        # Get the chat_id from URL
        chat_id = self.kwargs.get('chat_id')
        
        # Get the employee from the authenticated user
        user = self.request.user
        try:
            employee = user.employee
        except Employee.DoesNotExist:
            raise NotFound("Employee profile not found for this user.")
        
        # Verify that the chat belongs to the authenticated employee
        try:
            chat = Chat.objects.get(id=chat_id, employee=employee)
        except Chat.DoesNotExist:
            raise NotFound("Chat not found or you don't have permission to access it.")
        
        # Return messages for this chat in ascending order of created_at
        return Message.objects.filter(chat=chat).order_by('created_at')

    def perform_create(self, serializer):
        # Get the chat_id from URL
        chat_id = self.kwargs.get('chat_id')
        
        # Get the employee from the authenticated user
        user = self.request.user
        try:
            employee = user.employee
        except Employee.DoesNotExist:
            raise NotFound("Employee profile not found for this user.")
        
        # Verify that the chat belongs to the authenticated employee
        try:
            chat = Chat.objects.get(id=chat_id, employee=employee)
        except Chat.DoesNotExist:
            raise NotFound("Chat not found or you don't have permission to access it.")
        
        # Create the message with role set to "user"
        serializer.save(chat=chat, role='user')


class ChatWithAIMView(APIView):
    """
    API endpoint to send a message to AI and get a response.
    Creates both the user message and AI response in the database.
    
    POST /api/employees/chats/{chat_id}/chat/ - Send a message to AI and get response
    
    Request Body:
    {
        "content": "What is Python?"
    }
    
    Response:
    {
        "user_message": {
            "id": 1,
            "chat_id": 1,
            "role": "user",
            "content": "What is Python?",
            "created_at": "...",
            "updated_at": "..."
        },
        "ai_message": {
            "id": 2,
            "chat_id": 1,
            "role": "assistant",
            "content": "Python is a programming language...",
            "created_at": "...",
            "updated_at": "..."
        }
    }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, chat_id):
        # Get the employee from the authenticated user
        user = request.user
        try:
            employee = user.employee
        except Employee.DoesNotExist:
            raise NotFound("Employee profile not found for this user.")
        
        # Verify that the chat belongs to the authenticated employee
        try:
            chat = Chat.objects.get(id=chat_id, employee=employee)
        except Chat.DoesNotExist:
            raise NotFound("Chat not found or you don't have permission to access it.")
        
        # Get the user's message content
        content = request.data.get('content')
        if not content:
            return Response(
                {"error": "Content is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get chat history for context (before adding the new user message)
        previous_messages = Message.objects.filter(chat=chat).order_by('created_at')
        chat_history = []
        for msg in previous_messages:
            chat_history.append({
                "role": msg.role,
                "content": msg.content
            })
        
        # Save the user message
        user_message = Message.objects.create(
            chat=chat,
            role='user',
            content=content
        )
        
        # Get AI response from Gemini
        try:
            ai_response_text = get_gemini_response(chat_history, content)
        except Exception as e:
            # If Gemini fails, still save the user message but return an error
            return Response(
                {"error": f"Failed to get AI response: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Save the AI response
        ai_message = Message.objects.create(
            chat=chat,
            role='assistant',
            content=ai_response_text
        )
        
        # Update chat's updated_at timestamp
        chat.save()
        
        # Return both messages
        return Response({
            "user_message": MessageSerializer(user_message).data,
            "ai_message": MessageSerializer(ai_message).data
        }, status=status.HTTP_201_CREATED)

