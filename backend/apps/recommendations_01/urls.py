from rest_framework.routers import DefaultRouter
from apps.recommendations_01.views import (
    GenerateRecommendationsView,
    VideoRecommendationViewSet,
    CourseRecommendationViewSet,
    ArticleRecommendationViewSet,
    AgentRecommendationViewSet,
)

from django.urls import path


router = DefaultRouter()
router.register(
    r"videos",
    VideoRecommendationViewSet,
    basename="video-recommendations"
)
router.register(
    r"courses",
    CourseRecommendationViewSet,
    basename="course-recommendations"
)
router.register(
    r"articles",
    ArticleRecommendationViewSet,
    basename="article-recommendations"
)
router.register(
    r"agents",
    AgentRecommendationViewSet,
    basename="agent-recommendations"
)

urlpatterns = router.urls

urlpatterns = router.urls + [
    path(
        "generate/",
        GenerateRecommendationsView.as_view(),
        name="generate-recommendations",
    ),
]

