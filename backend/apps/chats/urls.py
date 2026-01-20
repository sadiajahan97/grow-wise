from django.urls import path, re_path
from apps.chats.views import ChatListView, MessageListView, ChatWithAIMView, ChatDetailView

urlpatterns = [
    # List all chats for authenticated employee or create a new one
    re_path(r'^$', ChatListView.as_view(), name='chat-list'),
    # Retrieve or delete a specific chat
    path('<int:pk>/', ChatDetailView.as_view(), name='chat-detail'),
    # List all messages for a specific chat (GET) or create a new message (POST)
    re_path(r'^(?P<chat_id>\d+)/messages/$', MessageListView.as_view(), name='message-list'),
    # Chat with AI - sends message and gets AI response
    re_path(r'^(?P<chat_id>\d+)/chat/$', ChatWithAIMView.as_view(), name='chat-with-ai'),
]

