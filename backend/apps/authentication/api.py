from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken


class LoginAPIView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        staff_id = request.data.get("staff_id")
        password = request.data.get("password")

        user = authenticate(username=staff_id, password=password)
        if not user:
            raise AuthenticationFailed("Invalid credentials")

        refresh = RefreshToken.for_user(user)
        
        return Response({
            "message": "Login successful",
            "staff_id": user.employee.staff_id,
            "is_superuser": user.is_superuser,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
