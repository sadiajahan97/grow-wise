from django.urls import path, include
from apps.employees.views import EmployeeProfileView, ProfessionListView

urlpatterns = [
    path('profile/', EmployeeProfileView.as_view(), name='profile'),
    path('professions/', ProfessionListView.as_view(), name='professions'),
    path('certifications/', include('apps.certifications.urls'), name='certifications'),
    path('chats/', include('apps.chats.urls'), name='chats'),
    path('notifications/', include('apps.notifications.urls'), name='notifications'),
]

