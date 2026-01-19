from django.contrib import admin
from django.urls import path

from apps.authentication.api import LoginAPIView

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/login/", LoginAPIView.as_view()),
]
