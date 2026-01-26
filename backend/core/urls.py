from django.contrib import admin
from django.urls import path, include

from apps.authentication.api import LoginAPIView
from apps.recommendations.api import RecommendationAPIView
from apps.recommendations.api_2 import RecommendationFromDBAPIView
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)


urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/login/", LoginAPIView.as_view(), name="login"),
    path("api/recommendations/generate/", RecommendationAPIView.as_view(), name="recommendations-generate"),
    path("api/recommendations/from-db/", RecommendationFromDBAPIView.as_view(), name="recommendations-from-db"),
    path("api/employees/", include('apps.employees.urls')),
    
    path('api/chatbot/', include('apps.chatbot.urls')),

]


# Documentation URLs
urlpatterns += [
    # OpenAPI schema (raw JSON/YAML)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),

    # Swagger UI
    path('api/schema/swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # Redoc UI
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]