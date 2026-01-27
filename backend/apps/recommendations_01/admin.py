from django.contrib import admin
from .models import (
    VideoRecommendation,
    CourseRecommendation,
    ArticleRecommendation,
    AgentRecommendation,
)


# Base admin configuration to reuse
class BaseRecommendationAdmin(admin.ModelAdmin):
    list_display = (
        "title_or_name",
        "user",
        "skill",
        "url",
        "source_or_type",
        "created_at",
    )
    list_filter = ("skill", "created_at")
    search_fields = ("title", "name", "skill", "url", "user__username", "user__email")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)

    def title_or_name(self, obj):
        return getattr(obj, "title", getattr(obj, "name", ""))
    title_or_name.short_description = "Title / Name"

    def source_or_type(self, obj):
        return getattr(obj, "source", "Agent")
    source_or_type.short_description = "Source / Type"


@admin.register(VideoRecommendation)
class VideoRecommendationAdmin(BaseRecommendationAdmin):
    pass


@admin.register(CourseRecommendation)
class CourseRecommendationAdmin(BaseRecommendationAdmin):
    pass


@admin.register(ArticleRecommendation)
class ArticleRecommendationAdmin(BaseRecommendationAdmin):
    pass


@admin.register(AgentRecommendation)
class AgentRecommendationAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "user",
        "skill",
        "created_at",
    )
    list_filter = ("skill", "created_at")
    search_fields = ("name", "skill", "user__username", "user__email")
    readonly_fields = ("created_at",)
    ordering = ("name",)
