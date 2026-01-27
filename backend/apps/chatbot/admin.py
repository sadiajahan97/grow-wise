from django.contrib import admin
from .models import ChatThread, UserMessage

@admin.register(ChatThread)
class ChatThreadAdmin(admin.ModelAdmin):
    # 1. Fields to display in the list view
    list_display = ('id', 'employee', 'title', 'created_at')
    
    # 2. Sidebar filters for quick navigation
    list_filter = ('employee', 'created_at')
    
    # 3. Search box configuration
    # Note: searching by 'id' is useful for debugging specific sessions
    search_fields = ('id', 'title', 'employee__email', 'employee__name')
    
    # 4. Make fields read-only to prevent accidental data corruption
    # Timestamps and UUIDs shouldn't be edited manually
    readonly_fields = ('id', 'created_at')
    
    # 5. Order by most recent by default
    ordering = ('-created_at',)

    # Optional: Organize the detail view layout
    fieldsets = (
        ('Thread Information', {
            'fields': ('id', 'title', 'employee')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
        }),
    )

    def has_add_permission(self, request):
        """Usually, threads are created via the API, not manually in admin."""
        return False
    
    
@admin.register(UserMessage)
class UserMessageAdmin(admin.ModelAdmin):
    list_display = ("user", "content", "created_at")
    search_fields = ("content", "user__username", "user__email")
    list_filter = ("created_at",)
    ordering = ("-created_at",)

    readonly_fields = ("id", "created_at")