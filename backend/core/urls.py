from django.contrib import admin
from django.urls import path

from apps.authentication.api import LoginAPIView
from apps.recommendations.api import RecommendationAPIView

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/login/", LoginAPIView.as_view(), name="login"),
    path("api/recommendations/", RecommendationAPIView.as_view(), name="recommendations"),

]
