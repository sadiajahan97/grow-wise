from django.contrib import admin
from django.urls import path, include

from apps.authentication.api import LoginAPIView
from apps.recommendations.api import RecommendationAPIView
from apps.recommendations.api_2 import RecommendationFromDBAPIView

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/login/", LoginAPIView.as_view(), name="login"),
    path("api/recommendations/", RecommendationAPIView.as_view(), name="recommendations"),
    path("api/recommendations/from-db/", RecommendationFromDBAPIView.as_view(), name="recommendations-from-db"),
    path("api/employees/", include('apps.employees.urls')),
]
