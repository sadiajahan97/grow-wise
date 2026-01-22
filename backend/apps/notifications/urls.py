from django.urls import path
from apps.notifications.views import NotificationListView, NotificationMarkReadView

urlpatterns = [
    path('', NotificationListView.as_view(), name='notifications-list'),
    path('<int:id>/read/', NotificationMarkReadView.as_view(), name='notification-mark-read'),
]

