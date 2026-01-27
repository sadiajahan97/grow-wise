from django.contrib import admin
from apps.certifications.models import Certification


@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'employee', 'link', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('employee__email', 'link')
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('employee',)

