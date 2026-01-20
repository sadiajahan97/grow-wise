from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Recommendation

class RecommendationFromDBAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        employee = request.user.employee

        qs = Recommendation.objects.filter(employee=employee)

        return Response({
            "generated_at": qs.first().created_at if qs.exists() else None,
            "recommendations": {
                "articles": qs.filter(content_type="article").values(),
                "videos": qs.filter(content_type="video").values(),
                "courses": qs.filter(content_type="course").values(),
            }
        })
