from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status, serializers
from rest_framework.permissions import IsAuthenticated
import logging
from django.db import OperationalError

from drf_spectacular.utils import (
    extend_schema,
    extend_schema_view,
    OpenApiResponse,
    inline_serializer,
)


from .models import ChatThread, UserMessage
from .serializers import ChatThreadSerializer
from apps.chatbot.bot import graph
from apps.employees.models import Employee

logger = logging.getLogger(__name__)


# =========================================================
# List & Create Chat Threads
# =========================================================

@extend_schema_view(
    get=extend_schema(
        summary="List chat threads",
        description="List all chat threads belonging to the authenticated user.",
        responses=ChatThreadSerializer(many=True),
        tags=["Chat Threads"],
    ),
    post=extend_schema(
        summary="Create chat thread",
        description="Create a new chat thread for the authenticated user.",
        request=ChatThreadSerializer,
        responses=ChatThreadSerializer,
        tags=["Chat Threads"],
    ),
)
class ThreadListCreateView(generics.ListCreateAPIView):
    serializer_class = ChatThreadSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            employee = self.request.user.employee
            return ChatThread.objects.filter(employee=employee)
        except OperationalError as e:
            logger.error(f"Database connection error in ThreadListCreateView: {str(e)}", exc_info=True)
            return ChatThread.objects.none()
        except Employee.DoesNotExist:
            return ChatThread.objects.none()
        except Exception as e:
            logger.error(f"Unexpected error in ThreadListCreateView: {str(e)}", exc_info=True)
            return ChatThread.objects.none()


# =========================================================
# Retrieve & Delete Chat Thread (with messages)
# =========================================================

@extend_schema(
    summary="Retrieve chat thread with messages",
    description=(
        "Retrieve a specific chat thread along with its conversation history "
        "stored in LangGraph persistence."
    ),
    responses=inline_serializer(
        name="ThreadDetailResponse",
        fields={
            "thread": ChatThreadSerializer(),
            "messages": inline_serializer(
                name="ChatMessage",
                many=True,
                fields={
                    "role": serializers.CharField(
                        help_text="Message role (user / assistant)"
                    ),
                    "content": serializers.CharField(
                        help_text="Message text"
                    ),
                },
            ),
        },
    ),
    tags=["Chat Threads"],
)
class ThreadDetailView(generics.RetrieveDestroyAPIView):
    queryset = ChatThread.objects.all()
    serializer_class = ChatThreadSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        config = {"configurable": {"thread_id": str(instance.id)}}
        
        try:
            # Pull history directly from LangGraph persistence
            state = graph.get_state(config)
            messages = state.values.get("messages", [])
            
            # Format for frontend
            formatted_messages = [
                {"role": m.type, "content": m.content} for m in messages
            ]
        except Exception as e:
            # Handle database connection errors and other exceptions
            logger.error(f"Error retrieving thread state: {str(e)}", exc_info=True)
            # Return thread info with empty messages if state retrieval fails
            formatted_messages = []
        
        return Response({
            "thread": self.get_serializer(instance).data,
            "messages": formatted_messages
        })
    
    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except OperationalError as e:
            logger.error(f"Database connection error in ThreadDetailView.destroy: {str(e)}", exc_info=True)
            return Response(
                {"error": "Database connection error", "detail": "Unable to delete thread. Please try again in a moment."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            logger.error(f"Error deleting thread: {str(e)}", exc_info=True)
            return Response(
                {"error": "Error deleting thread", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# =========================================================
# Chat with AI (LangGraph)
# =========================================================

@extend_schema(
    summary="Chat with AI",
    description="""
Send a message to the AI assistant.

• If `thread_id` is **not provided**, a new chat thread is created.
• If `thread_id` **is provided**, the message is appended to the existing thread.
""",
    request=inline_serializer(
        name="ChatRequest",
        fields={
            "message": serializers.CharField(
                help_text="User message to send to the AI"
            ),
            "thread_id": serializers.UUIDField(
                required=False,
                allow_null=True,
                help_text="Existing chat thread ID (optional)"
            ),
        },
    ),
    responses={
        200: inline_serializer(
            name="ChatResponse",
            fields={
                "response": serializers.CharField(
                    help_text="AI generated response"
                ),
                "thread_id": serializers.UUIDField(
                    help_text="Chat thread ID"
                ),
                "title": serializers.CharField(
                    help_text="Thread title"
                ),
            },
        ),
        404: OpenApiResponse(
            description="Thread not found or unauthorized"
        ),
    },
    tags=["Chat"],
)
class ChatAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_message = request.data.get("message")
        thread_id = request.data.get("thread_id") # Can be null for a new chat

        if not user_message:
             return Response({"error": "Message content is required"}, status=400)
         
        # Get employee for the user
        try:
            employee = request.user.employee
        except Employee.DoesNotExist:
            return Response({"error": "Employee profile not found"}, status=404)

        # 1. Handle Thread Creation
        if not thread_id:
            # First time chatting? Create a entry in our Django Metadata table
            thread = ChatThread.objects.create(
                employee=employee, 
                title=user_message[:30] + "..." # Use first 30 chars as temporary title
            )
            thread_id = str(thread.id)
        else:
            # Security Check: Ensure this employee actually owns this thread
            thread = ChatThread.objects.filter(id=thread_id, employee=employee).first()
            if not thread:
                return Response({"error": "Thread not found or unauthorized"}, status=404)

        # Save ONLY the user's message
        try:
            UserMessage.objects.create(
                thread=thread,
                employee=employee,
                content=user_message
            )
        except Exception as e:
            logger.error(f"Error saving user message: {str(e)}", exc_info=True)
            # Continue even if message save fails, as LangGraph will still work

        # Invoke LangGraph
        config = {"configurable": {"thread_id": thread_id}}
        input_state = {"messages": [("user", user_message)]}
        
        try:
            # LangGraph automatically pulls history from Postgres using thread_id
            output = graph.invoke(input_state, config=config)
            
            # Final AI Response
            ai_response = output["messages"][-1].content if output.get("messages") else "I'm having trouble processing your request right now. Please try again."
        except Exception as e:
            logger.error(f"Error invoking LangGraph: {str(e)}", exc_info=True)
            # Return a user-friendly error message
            return Response({
                "error": "Unable to connect to the chat service. Please try again in a moment.",
                "thread_id": thread_id,
                "title": thread.title
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        return Response({
            "response": ai_response,
            "thread_id": thread_id,
            "title": thread.title
        })