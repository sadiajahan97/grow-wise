from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import NotFound
from django.utils import timezone
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


class RecommendationClickAPIView(APIView):
    """
    API endpoint to record when a user clicks on a recommendation.
    
    POST /api/recommendations/{id}/click/ - Records a click on a recommendation
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        employee = request.user.employee
        
        try:
            recommendation = Recommendation.objects.get(
                id=id,
                employee=employee
            )
        except Recommendation.DoesNotExist:
            raise NotFound("Recommendation not found or you don't have permission to access it.")
        
        # Update clicked_at timestamp
        recommendation.clicked_at = timezone.now()
        recommendation.save(update_fields=['clicked_at'])
        
        return Response({
            "message": "Recommendation click recorded successfully",
            "recommendation_id": recommendation.id,
            "clicked_at": recommendation.clicked_at
        }, status=status.HTTP_200_OK)
