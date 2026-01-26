from rest_framework import serializers
from .models import ChatThread

class ChatThreadSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatThread
        fields = ['id', 'title', 'created_at']