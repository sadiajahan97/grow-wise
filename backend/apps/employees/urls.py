from django.urls import path, include
from apps.employees.views import EmployeeProfileView

urlpatterns = [
    path('profile/', EmployeeProfileView.as_view(), name='employee-profile'),
    path('profile', EmployeeProfileView.as_view(), name='employee-profile-no-slash'),
    # Handle both with and without trailing slash for certifications
    path('certifications/', include('apps.certifications.urls')),
    path('certifications', include('apps.certifications.urls')),
    # Handle both with and without trailing slash for chats
    path('chats/', include('apps.chats.urls')),
    path('chats', include('apps.chats.urls')),
]

