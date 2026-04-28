from rest_framework import viewsets
from .models import Medicine
from .serializers import MedicineSerializer

# Create your views here.

class MedicineViewSet(viewsets.ModelViewSet):
    serializer_class = MedicineSerializer

    def get_queryset(self):
        return Medicine.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)