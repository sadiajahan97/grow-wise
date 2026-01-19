from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.serializers import RegisterSerializer

User = get_user_model()


# ====================
# Registration
# ====================
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                'message': 'Registration successful. Auto logged in.',
                'user': {
                    'id': user.id,
                    'name': user.name,
                    'designation': user.designation,
                    'department': user.department,
                },
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            status=status.HTTP_201_CREATED
        )


# ====================
# JWT Login
# ====================
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        staff_id = request.data.get('staff_id')
        password = request.data.get('password')

        if not staff_id or not password:
            return Response(
                {'detail': 'Staff ID and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(id=staff_id)
        except (User.DoesNotExist, ValueError):
            return Response(
                {'detail': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.check_password(password):
            return Response(
                {'detail': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                'message': 'Login successful.',
                'user': {
                    'id': user.id,
                    'name': user.name,
                    'designation': user.designation,
                    'department': user.department,
                },
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            status=status.HTTP_200_OK
        )
