from rest_framework import serializers
from apps.chats.models import Chat, Message


class ChatSerializer(serializers.ModelSerializer):
    staff_id = serializers.CharField(source='employee.staff_id', read_only=True)

    class Meta:
        model = Chat
        fields = [
            'id',
            'staff_id',
            'name',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'staff_id', 'created_at', 'updated_at']


class ChatCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ['name']


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = [
            'id',
            'chat_id',
            'role',
            'content',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'chat_id', 'created_at', 'updated_at']


class MessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['content']

