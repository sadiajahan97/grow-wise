from django.contrib import admin
from .models import ChatThread

@admin.register(ChatThread)
class ChatThreadAdmin(admin.ModelAdmin):
    # 1. Fields to display in the list view
    list_display = ('id', 'user', 'title', 'created_at')
    
    # 2. Sidebar filters for quick navigation
    list_filter = ('user', 'created_at')
    
    # 3. Search box configuration
    # Note: searching by 'id' is useful for debugging specific sessions
    search_fields = ('id', 'title', 'user__username', 'user__email')
    
    # 4. Make fields read-only to prevent accidental data corruption
    # Timestamps and UUIDs shouldn't be edited manually
    readonly_fields = ('id', 'created_at')
    
    # 5. Order by most recent by default
    ordering = ('-created_at',)

    # Optional: Organize the detail view layout
    fieldsets = (
        ('Thread Information', {
            'fields': ('id', 'title', 'user')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
        }),
    )

    def has_add_permission(self, request):
        """Usually, threads are created via the API, not manually in admin."""
        return False