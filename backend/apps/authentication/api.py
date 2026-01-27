from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed, ValidationError
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from apps.employees.models import Employee, Profession

class LoginAPIView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email:
            raise AuthenticationFailed("Email is required")
        
        if not password:
            raise AuthenticationFailed("Password is required")

        # Find employee by email
        try:
            employee = Employee.objects.get(email=email)
        except Employee.DoesNotExist:
            raise AuthenticationFailed("Invalid credentials")

        # Authenticate using the associated user's username
        user = authenticate(username=employee.user.username, password=password)
        if not user:
            raise AuthenticationFailed("Invalid credentials")

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        return Response({
            "message": "Login successful",
            "email": employee.email,
            "is_superuser": user.is_superuser,
            "access_token": access_token
        })


class RegisterAPIView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        name = request.data.get("name")
        profession_id = request.data.get("profession_id")

        # Validate required fields
        if not email:
            raise ValidationError("Email is required")
        
        if not password:
            raise ValidationError("Password is required")
        
        if not name:
            raise ValidationError("Name is required")

        # Check if email already exists
        if Employee.objects.filter(email=email).exists():
            raise ValidationError("An account with this email already exists")

        # Check if username already exists (use email as username)
        if User.objects.filter(username=email).exists():
            raise ValidationError("An account with this email already exists")

        # Validate profession if provided
        profession = None
        if profession_id:
            try:
                profession = Profession.objects.get(id=profession_id)
            except Profession.DoesNotExist:
                raise ValidationError("Invalid profession ID")

        # Create User
        try:
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password,
                first_name=name.split()[0] if name.split() else name,
                last_name=' '.join(name.split()[1:]) if len(name.split()) > 1 else ''
            )
        except Exception as e:
            raise ValidationError(f"Error creating user: {str(e)}")

        # Create Employee
        try:
            employee = Employee.objects.create(
                user=user,
                email=email,
                name=name,
                profession=profession
            )
        except Exception as e:
            # If employee creation fails, delete the user
            user.delete()
            raise ValidationError(f"Error creating employee: {str(e)}")

        # Generate JWT tokens for auto-login
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        return Response({
            "message": "Registration successful",
            "email": employee.email,
            "name": employee.name,
            "is_superuser": user.is_superuser,
            "access_token": access_token
        }, status=status.HTTP_201_CREATED)
