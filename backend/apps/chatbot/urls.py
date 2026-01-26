from django.urls import path
from .views import ChatAPIView, ThreadListCreateView, ThreadDetailView

urlpatterns = [
    # 1. The main chat endpoint (handles sending new & existing messages)
    path('chat/', ChatAPIView.as_view(), name='chatbot_chat'),

    # 2. Sidebar/History endpoints
    path('threads/', ThreadListCreateView.as_view(), name='thread_list'),
    path('threads/<uuid:pk>/', ThreadDetailView.as_view(), name='thread_detail'),
]