from rest_framework import generics
from .models import DailyCheckIn
from .serializers import DailyCheckInSerializer

# Create your views here.

class CheckInListCreateView(generics.ListCreateAPIView):
    serializer_class = DailyCheckInSerializer

    def get_queryset(self):
        return DailyCheckIn.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)