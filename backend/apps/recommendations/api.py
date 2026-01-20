from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .services import generate_recommendations

class RecommendationAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.is_superuser:
            return Response({"message": "Admins do not receive recommendations"})

        employee = user.employee
        recs = generate_recommendations(employee)

        return Response({
            "staff_id": employee.staff_id,
            "recommendations": [
                {
                    "title": r.title,
                    "type": r.content_type,
                    "url": r.url,
                    "reason": r.reason
                } for r in recs
            ]
        })
