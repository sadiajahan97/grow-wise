from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from django.utils import timezone
from apps.employees.models import Employee
from apps.employees.serializers import EmployeeProfileSerializer


class EmployeeProfileView(APIView):
    """
    API endpoint to get the authenticated employee's profile.
    
    GET /api/employees/profile/ - Returns the profile of the authenticated employee
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            employee = request.user.employee
        except Employee.DoesNotExist:
            raise NotFound("Employee profile not found for this user.")
        
        # Update last_visited_at timestamp
        employee.last_visited_at = timezone.now()
        employee.save(update_fields=['last_visited_at'])
        
        serializer = EmployeeProfileSerializer(employee)
        return Response(serializer.data, status=status.HTTP_200_OK)

