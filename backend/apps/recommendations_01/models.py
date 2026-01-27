from django.conf import settings
from django.db import models


# Video Recommendation Model
# ===================================================
class VideoRecommendation(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="video_recommendations"
    )

    skill = models.CharField(max_length=100)

    title = models.CharField(max_length=255)
    description = models.TextField()

    url = models.URLField(max_length=500)
    source = models.CharField(max_length=100)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        

# Course Recommendation Model
# ===================================================
class CourseRecommendation(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="course_recommendations"
    )

    skill = models.CharField(max_length=100)

    title = models.CharField(max_length=255)
    description = models.TextField()

    url = models.URLField(max_length=500)
    source = models.CharField(max_length=100)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]



# Article Recommendation Model
# ===================================================
class ArticleRecommendation(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="article_recommendations"
    )

    skill = models.CharField(max_length=100)

    title = models.CharField(max_length=255)
    description = models.TextField()

    url = models.URLField(max_length=500)
    source = models.CharField(max_length=100)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


# Agent Recommendation Model
# ==================================================
class AgentRecommendation(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="agent_recommendations"
    )

    skill = models.CharField(max_length=100)

    name = models.CharField(max_length=100)
    system_prompt = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]