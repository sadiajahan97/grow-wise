from django.urls import path
from apps.certifications.views import (
    CertificationListCreateView,
    CertificationDetailView,
)

urlpatterns = [
    # List all certifications for authenticated employee or create a new one
    path('', CertificationListCreateView.as_view(), name='certification-list-create'),
    
    # Retrieve, update, or delete a specific certification
    path('<int:pk>/', CertificationDetailView.as_view(), name='certification-detail'),
]

