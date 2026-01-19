from django.contrib import admin
from django.urls import path, include

from apps.authentication.api import LoginAPIView

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/login/", LoginAPIView.as_view()),
    path("api/employees/", include('apps.employees.urls')),
]
