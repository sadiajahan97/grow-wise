from django.urls import path, re_path
from apps.chats.views import ChatListView, MessageListView

urlpatterns = [
    # List all chats for authenticated employee
    re_path(r'^$', ChatListView.as_view(), name='chat-list'),
    # List all messages for a specific chat
    re_path(r'^(?P<chat_id>\d+)/messages/$', MessageListView.as_view(), name='message-list'),
    re_path(r'^(?P<chat_id>\d+)/messages$', MessageListView.as_view(), name='message-list-no-slash'),
]

