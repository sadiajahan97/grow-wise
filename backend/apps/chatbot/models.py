from django.db import models
from django.conf import settings
import uuid

# ========================================================
# ChatThread Model
class ChatThread(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=255, default="New Chat")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        

# =======================================================
# ChatDocument Model
class ChatDocument(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    thread = models.ForeignKey(ChatThread, on_delete=models.CASCADE, related_name="documents")
    file = models.FileField(upload_to="chat_docs/")
    file_name = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.file_name