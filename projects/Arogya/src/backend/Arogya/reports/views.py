from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import DischargeReport
from .serializers import DischargeReportSerializer


class ReportUploadView(generics.CreateAPIView):
    serializer_class = DischargeReportSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(patient=self.request.user)


class ReportListView(generics.ListAPIView):
    serializer_class = DischargeReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DischargeReport.objects.filter(patient=self.request.user)


class ReportDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = DischargeReportSerializer
    permission_classes = [IsAuthenticated]
    lookup_url_kwarg = "id"

    def get_queryset(self):
        return DischargeReport.objects.filter(patient=self.request.user)
