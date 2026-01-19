from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from django.shortcuts import get_object_or_404
from apps.certifications.models import Certification
from apps.certifications.serializers import CertificationSerializer, CertificationCreateSerializer
from apps.employees.models import Employee


class CertificationListCreateView(generics.ListCreateAPIView):
    """
    API endpoint to list all certifications for the authenticated employee or create a new certification.
    
    GET /api/employees/certifications/ - Returns certifications for the authenticated employee
    POST /api/employees/certifications/ - Creates a new certification for the authenticated employee
    
    POST Request Body:
    {
        "link": "https://example.com/certificate"
    }
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CertificationCreateSerializer
        return CertificationSerializer

    def get_queryset(self):
        # Get the employee from the authenticated user
        user = self.request.user
        try:
            employee = user.employee
            return Certification.objects.filter(employee=employee)
        except Employee.DoesNotExist:
            return Certification.objects.none()

    def perform_create(self, serializer):
        # Automatically associate the certification with the authenticated user's employee
        user = self.request.user
        try:
            employee = user.employee
        except Employee.DoesNotExist:
            raise NotFound("Employee profile not found for this user.")
        serializer.save(employee=employee)


class CertificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint to retrieve, update, or delete a specific certification.
    Only allows access to certifications belonging to the authenticated employee.
    
    GET /api/employees/certifications/{id}/ - Retrieve a specific certification
    PUT /api/employees/certifications/{id}/ - Update a specific certification (full update)
    PATCH /api/employees/certifications/{id}/ - Partially update a specific certification
    DELETE /api/employees/certifications/{id}/ - Delete a specific certification
    
    PUT/PATCH Request Body:
    {
        "link": "https://example.com/updated-certificate"
    }
    """
    serializer_class = CertificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only return certifications for the authenticated employee
        user = self.request.user
        try:
            employee = user.employee
            return Certification.objects.filter(employee=employee)
        except Employee.DoesNotExist:
            return Certification.objects.none()

    def update(self, request, *args, **kwargs):
        """
        Update a certification and return the updated certification.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """
        Delete a certification and return a success message.
        """
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {"message": "Certification deleted successfully."},
            status=status.HTTP_200_OK
        )

