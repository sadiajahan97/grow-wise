from rest_framework import generics, permissions
from rest_framework.exceptions import NotFound, PermissionDenied
from apps.chats.models import Chat, Message
from apps.chats.serializers import ChatSerializer, MessageSerializer
from apps.employees.models import Employee


class ChatListView(generics.ListAPIView):
    """
    API endpoint to list all chats for the authenticated employee.
    
    GET /api/employees/chats/ - Returns chats for the authenticated employee
    """
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Get the employee from the authenticated user
        user = self.request.user
        try:
            employee = user.employee
            return Chat.objects.filter(employee=employee)
        except Employee.DoesNotExist:
            return Chat.objects.none()


class MessageListView(generics.ListAPIView):
    """
    API endpoint to list all messages for a specific chat.
    Only returns messages for chats belonging to the authenticated employee.
    
    GET /api/employees/chats/{chat_id}/messages/ - Returns messages for the specified chat
    """
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

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
        
        # Return messages for this chat
        return Message.objects.filter(chat=chat)

