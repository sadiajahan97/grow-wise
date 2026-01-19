from django.urls import path, include

urlpatterns = [
    # Handle both with and without trailing slash for certifications
    path('certifications/', include('apps.certifications.urls')),
    path('certifications', include('apps.certifications.urls')),
]

