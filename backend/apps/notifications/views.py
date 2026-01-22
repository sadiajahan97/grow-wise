from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound
from apps.notifications.models import Notification
from apps.notifications.serializers import NotificationSerializer
from apps.employees.models import Employee


class NotificationListView(generics.ListAPIView):
    """
    API endpoint to list all notifications for the authenticated employee.
    
    GET /api/employees/notifications/ - Returns notifications for the authenticated employee
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        # Get the employee from the authenticated user
        user = self.request.user
        try:
            employee = user.employee
            # Return notifications in descending order of created_at (newest first)
            return Notification.objects.filter(employee=employee).order_by('-created_at')
        except Employee.DoesNotExist:
            return Notification.objects.none()


class NotificationMarkReadView(APIView):
    """
    API endpoint to mark a notification as read.
    
    PATCH /api/employees/notifications/{id}/read/ - Marks a notification as read
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, id):
        user = request.user
        try:
            employee = user.employee
        except Employee.DoesNotExist:
            raise NotFound("Employee profile not found for this user.")
        
        try:
            notification = Notification.objects.get(id=id, employee=employee)
        except Notification.DoesNotExist:
            raise NotFound("Notification not found or you don't have permission to access it.")
        
        # Mark as read
        notification.is_read = True
        notification.save(update_fields=['is_read'])
        
        serializer = NotificationSerializer(notification)
        return Response(serializer.data, status=status.HTTP_200_OK)

