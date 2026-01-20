from django.contrib import admin
from django.utils.html import format_html

from .models import Recommendation


@admin.register(Recommendation)
class RecommendationAdmin(admin.ModelAdmin):
    # ---------- List View ----------
    list_display = (
        "id",
        "employee",
        "title",
        "content_type",
        "thumbnail_preview",
        "created_at",
    )

    list_filter = (
        "content_type",
        "created_at",
    )

    search_fields = (
        "title",
        "reason",
        "employee__name",   # adjust if Employee uses a different field
        "employee__email",
    )

    ordering = ("-created_at",)

    # ---------- Detail View ----------
    readonly_fields = (
        "created_at",
        "thumbnail_preview",
    )

    fieldsets = (
        ("Employee Information", {
            "fields": ("employee",),
        }),
        ("Recommendation Content", {
            "fields": (
                "title",
                "content_type",
                "url",
                "thumbnail_url",
                "thumbnail_preview",
            ),
        }),
        ("Why this was recommended", {
            "fields": ("reason",),
        }),
        ("Metadata", {
            "fields": ("created_at",),
        }),
    )

    # ---------- Custom Methods ----------
    def thumbnail_preview(self, obj):
        if obj.thumbnail_url:
            return format_html(
                '<img src="{}" style="height:60px;border-radius:6px;" />',
                obj.thumbnail_url,
            )
        return "—"

    thumbnail_preview.short_description = "Thumbnail"
