from django.db import models
from django.contrib.auth.models import User
from doctors.models import Doctor

# Create your models here.


class ChatMessage(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='messages')
    message = models.TextField()
    is_from_doctor = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.sender.username}"