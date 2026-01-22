from django.contrib import admin
from apps.notifications.models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('employee', 'message', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('employee__staff_id', 'employee__name', 'message')
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('employee',)

