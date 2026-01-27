from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.permissions import IsAuthenticated
import asyncio
from asgiref.sync import async_to_sync
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

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


# ViewSets for Video Recommendations
# ==================================================
class VideoRecommendationViewSet(ReadOnlyModelViewSet):
    serializer_class = VideoRecommendationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return VideoRecommendation.objects.filter(
            user=self.request.user
        )

# ViewSets for Course Recommendations
# =================================================
class CourseRecommendationViewSet(ReadOnlyModelViewSet):
    serializer_class = CourseRecommendationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CourseRecommendation.objects.filter(
            user=self.request.user
        )

# ViewSets for Article Recommendations
# ==================================================
class ArticleRecommendationViewSet(ReadOnlyModelViewSet):
    serializer_class = ArticleRecommendationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ArticleRecommendation.objects.filter(
            user=self.request.user
        )

# ViewSets for Agent Recommendations
# ==================================================
class AgentRecommendationViewSet(ReadOnlyModelViewSet):
    serializer_class = AgentRecommendationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AgentRecommendation.objects.filter(
            user=self.request.user
        )




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
        user_questions = UserMessage.objects.filter(
            user=user
        ).values_list('content', flat=True)

        if not user_questions:
            return Response({"detail": "No questions found for analysis."}, status=400)

        # 2. Convert QuerySet to list for the agents
        history_context_list = list(user_questions)[:50]
        
        print("History Context List:", history_context_list)

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
            return Response(
                {"error": str(e), "detail": "Error running AI agents"}, 
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

