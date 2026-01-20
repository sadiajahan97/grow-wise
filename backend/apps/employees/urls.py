from django.urls import path, include
from apps.employees.views import EmployeeProfileView

urlpatterns = [
    path('profile/', EmployeeProfileView.as_view()),
    path('certifications/', include('apps.certifications.urls')),
    path('chats/', include('apps.chats.urls')),
]

