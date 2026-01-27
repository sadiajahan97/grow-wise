from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.permissions import IsAuthenticated
import asyncio
import logging
from asgiref.sync import async_to_sync
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import OperationalError

from apps.chatbot.models import UserMessage
from apps.recommendations_01.agents.article_agent import article_agent
from apps.recommendations_01.agents.course_agent import course_agent
from apps.recommendations_01.agents.custom_agent_builder import custom_agent_builder
from apps.recommendations_01.agents.video_agent import video_agent

from .models import (
    VideoRecommendation,
    CourseRecommendation,
    ArticleRecommendation,
    AgentRecommendation,
)
from .serializers import (
    VideoRecommendationSerializer,
    CourseRecommendationSerializer,
    ArticleRecommendationSerializer,
    AgentRecommendationSerializer,
)

logger = logging.getLogger(__name__)


# ViewSets for Video Recommendations
# ==================================================
class VideoRecommendationViewSet(ReadOnlyModelViewSet):
    serializer_class = VideoRecommendationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            return VideoRecommendation.objects.filter(
                user=self.request.user
            )
        except OperationalError as e:
            logger.error(f"Database connection error in VideoRecommendationViewSet: {str(e)}", exc_info=True)
            return VideoRecommendation.objects.none()
        except Exception as e:
            logger.error(f"Unexpected error in VideoRecommendationViewSet: {str(e)}", exc_info=True)
            return VideoRecommendation.objects.none()

# ViewSets for Course Recommendations
# =================================================
class CourseRecommendationViewSet(ReadOnlyModelViewSet):
    serializer_class = CourseRecommendationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            return CourseRecommendation.objects.filter(
                user=self.request.user
            )
        except OperationalError as e:
            logger.error(f"Database connection error in CourseRecommendationViewSet: {str(e)}", exc_info=True)
            return CourseRecommendation.objects.none()
        except Exception as e:
            logger.error(f"Unexpected error in CourseRecommendationViewSet: {str(e)}", exc_info=True)
            return CourseRecommendation.objects.none()

# ViewSets for Article Recommendations
# ==================================================
class ArticleRecommendationViewSet(ReadOnlyModelViewSet):
    serializer_class = ArticleRecommendationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            return ArticleRecommendation.objects.filter(
                user=self.request.user
            )
        except OperationalError as e:
            logger.error(f"Database connection error in ArticleRecommendationViewSet: {str(e)}", exc_info=True)
            return ArticleRecommendation.objects.none()
        except Exception as e:
            logger.error(f"Unexpected error in ArticleRecommendationViewSet: {str(e)}", exc_info=True)
            return ArticleRecommendation.objects.none()

# ViewSets for Agent Recommendations
# ==================================================
class AgentRecommendationViewSet(ReadOnlyModelViewSet):
    serializer_class = AgentRecommendationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            return AgentRecommendation.objects.filter(
                user=self.request.user
            )
        except OperationalError as e:
            logger.error(f"Database connection error in AgentRecommendationViewSet: {str(e)}", exc_info=True)
            return AgentRecommendation.objects.none()
        except Exception as e:
            logger.error(f"Unexpected error in AgentRecommendationViewSet: {str(e)}", exc_info=True)
            return AgentRecommendation.objects.none()




# ===============================
# Recommendation Generation API VIEW
# =============================
class GenerateRecommendationsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        profession = request.data.get("profession")
        
        if not profession:
            return Response({"detail": "Profession is required."}, status=400)
        
        # Fetch all user messages directly
        try:
            employee = user.employee
        except OperationalError as e:
            logger.error(f"Database connection error getting employee: {str(e)}", exc_info=True)
            return Response(
                {"detail": "Database connection error. Please try again in a moment."}, 
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            logger.error(f"Error getting employee: {str(e)}", exc_info=True)
            return Response({"detail": "Employee profile not found."}, status=400)
        
        try:
            user_questions = UserMessage.objects.filter(
                employee=employee
            ).values_list('content', flat=True)

            # Convert QuerySet to list for the agents (can be empty if no chat history)
            history_context_list = list(user_questions)[:50]
        except OperationalError as e:
            logger.error(f"Database connection error fetching user messages: {str(e)}", exc_info=True)
            # Continue with empty history if we can't fetch messages
            history_context_list = []
        except Exception as e:
            logger.error(f"Error fetching user messages: {str(e)}", exc_info=True)
            history_context_list = []
        
        # If no profession provided, try to get it from employee
        if not profession:
            try:
                profession = employee.profession.name if employee.profession else "General"
            except OperationalError as e:
                logger.error(f"Database connection error getting profession: {str(e)}", exc_info=True)
                profession = "General"
            except Exception:
                profession = "General"
        
        print("History Context List:", history_context_list)
        print("Profession:", profession)

        async def run_agents_parallel():
            # Create tasks
            video_task = video_agent(user, profession, history_context_list)
            article_task = article_agent(user, profession, history_context_list)
            course_task = course_agent(user, profession, history_context_list)
            custom_agent_task = custom_agent_builder(user, profession, history_context_list)

            # Run them concurrently
            return await asyncio.gather(
                video_task,
                article_task,
                course_task,
                custom_agent_task
            )
            
        try:
            video_results, article_results, course_results, custom_agent_results = async_to_sync(run_agents_parallel)()
        except Exception as e:
            # Good practice to catch agent errors
            import traceback
            error_traceback = traceback.format_exc()
            print(f"Error in recommendation generation: {error_traceback}")
            return Response(
                {"error": str(e), "detail": "Error running AI agents", "traceback": error_traceback}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(
            {
                "status": "success",
                "video_recommendations": len(video_results),
                "article_recommendations": len(article_results),
                "course_recommendations": len(course_results),
                "custom_agent_recommendations": len(custom_agent_results),
            },
            status=status.HTTP_201_CREATED
        )

