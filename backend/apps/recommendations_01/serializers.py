from rest_framework import serializers
from .models import (
    VideoRecommendation,
    CourseRecommendation,
    ArticleRecommendation,
    AgentRecommendation,
)


class VideoRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoRecommendation
        fields = [
            "id",
            "skill",
            "title",
            "description",
            "url",
            "source",
            "created_at",
        ]


class CourseRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseRecommendation
        fields = [
            "id",
            "skill",
            "title",
            "description",
            "url",
            "source",
            "created_at",
        ]


class ArticleRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArticleRecommendation
        fields = [
            "id",
            "skill",
            "title",
            "description",
            "url",
            "source",
            "created_at",
        ]


class AgentRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentRecommendation
        fields = [
            "id",
            "skill",
            "name",
            "system_prompt",
            "created_at",
        ]
