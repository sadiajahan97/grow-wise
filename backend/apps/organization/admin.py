from django.contrib import admin

from .models import (
    Department,
    Designation,
    JobDescription,
    CareerPath,
)


# =========================
# Department
# =========================
@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)
    ordering = ("name",)


# =========================
# Designation
# =========================
@admin.register(Designation)
class DesignationAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "department")
    list_filter = ("department",)
    search_fields = ("name", "department__name")
    ordering = ("department__name", "name")


# =========================
# Job Description
# =========================
@admin.register(JobDescription)
class JobDescriptionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "designation",
        "version",
        "is_active",
    )

    list_filter = (
        "designation__department",
        "is_active",
    )

    search_fields = (
        "designation__name",
        "designation__department__name",
        "job_description",
    )

    ordering = (
        "designation__name",
        "-version",
    )

    list_editable = ("is_active",)

    fieldsets = (
        ("Role Information", {
            "fields": ("designation",),
        }),
        ("Job Description", {
            "fields": ("job_description",),
        }),
        ("Versioning", {
            "fields": ("version", "is_active"),
        }),
    )


# =========================
# Career Path
# =========================
@admin.register(CareerPath)
class CareerPathAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "from_designation",
        "to_designation",
    )

    list_filter = (
        "from_designation__department",
        "to_designation__department",
    )

    search_fields = (
        "from_designation__name",
        "to_designation__name",
    )

    ordering = (
        "from_designation__department__name",
        "from_designation__name",
    )
