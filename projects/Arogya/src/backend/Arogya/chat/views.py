from rest_framework import generics
from .models import ChatMessage
from .serializers import ChatMessageSerializer
# Create your views here.

class ChatListCreateView(generics.ListCreateAPIView):
    serializer_class = ChatMessageSerializer

    def get_queryset(self):
        return ChatMessage.objects.filter(sender=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)