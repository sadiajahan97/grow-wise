from django.db import models
from apps.employees.models import Employee

class Recommendation(models.Model):
    CONTENT_TYPES = (
        ("article", "Article"),
        ("video", "Video"),
        ("course", "Course"),
    )

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    url = models.URLField()
    thumbnail_url = models.URLField(blank=True, null=True)
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPES)
    reason = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
