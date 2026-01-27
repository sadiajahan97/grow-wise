from django.db import models
import uuid
from django.conf import settings
from apps.employees.models import Employee

# ========================================================
# ChatThread Model
class ChatThread(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="chat_threads")
    title = models.CharField(max_length=255, default="New Chat")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        

# ========================================================
# UserMessage Model
#=======================================================        
class UserMessage(models.Model):
    """
    Stores ONLY user queries for analysis and recommendations.
    AI responses are not stored here (they live in LangGraph persistence).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    thread = models.ForeignKey(ChatThread, on_delete=models.CASCADE, related_name="user_messages")
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="user_messages")
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        # Index for extremely fast retrieval during recommendation generation
        indexes = [
            models.Index(fields=['employee', '-created_at']),
        ]        


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