from django.contrib import admin
from apps.chats.models import Chat, Message


@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ('employee', 'name', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('employee__staff_id', 'employee__name', 'name')
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('employee',)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('chat', 'role', 'created_at', 'updated_at')
    list_filter = ('role', 'created_at', 'updated_at')
    search_fields = ('chat__name', 'content')
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('chat',)

