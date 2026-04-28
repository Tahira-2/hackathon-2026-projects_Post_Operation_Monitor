from rest_framework import generics
from .models import Doctor
from .serializers import DoctorSerializer

# Create your views here.

class DoctorListView(generics.ListAPIView):
    serializer_class = DoctorSerializer

    def get_queryset(self):
        return Doctor.objects.filter(available=True)