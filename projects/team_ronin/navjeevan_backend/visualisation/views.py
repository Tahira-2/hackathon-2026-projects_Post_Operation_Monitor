from rest_framework import viewsets, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.db.models import Avg

from .models import District, VaccinationRecord, IndividualVaccinationRecord
from .serializers import (
    DistrictSerializer,
    VaccinationRecordSerializer,
    CoverageMapSerializer,
    DistrictDetailSerializer,
    IndividualVaccinationSerializer,
)


class DistrictViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = District.objects.all()
    serializer_class = DistrictSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class CoverageViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Endpoints:
        GET /api/coverage/?year=2024
            → all districts' coverage for the choropleth map

        GET /api/coverage/<id>/
            → full detail for one record (used when clicking a district + year)

        GET /api/coverage/<id>/history/
            → all years for a single district (for the year trend chart)

        GET /api/coverage/years/
            → list of all available years in the dataset
    """
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = VaccinationRecord.objects.select_related("district")
        year = self.request.query_params.get("year")
        district = self.request.query_params.get("district")
        province = self.request.query_params.get("province")

        if year:
            qs = qs.filter(year=year)
        if district:
            qs = qs.filter(district__id=district)
        if province:
            qs = qs.filter(district__province__icontains=province)

        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return CoverageMapSerializer
        return DistrictDetailSerializer

    @action(detail=False, methods=["get"], url_path="years")
    def years(self, request):
        """GET /api/coverage/years/ — returns sorted list of available years."""
        years = (
            VaccinationRecord.objects
            .values_list("year", flat=True)
            .distinct()
            .order_by("year")
        )
        return Response(list(years))

    @action(detail=True, methods=["get"], url_path="history")
    def history(self, request, pk=None):
        """GET /api/coverage/<district_id>/history/ — year-over-year data for one district."""
        records = (
            VaccinationRecord.objects
            .filter(district__id=pk)
            .select_related("district")
            .order_by("year")
        )
        serializer = DistrictDetailSerializer(records, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="national-average")
    def national_average(self, request):
        """GET /api/coverage/national-average/?year=2024 — avg coverage per vaccine across all districts."""
        year = request.query_params.get("year")
        qs = VaccinationRecord.objects.all()
        if year:
            qs = qs.filter(year=year)

        avg = qs.aggregate(
            avg_bcg=Avg("bcg"),
            avg_dpt3=Avg("dpt_3"),
            avg_penta3=Avg("penta_3"),
            avg_opv3=Avg("opv_3"),
            avg_hepb3=Avg("hep_b3"),
            avg_meas1=Avg("meas_1"),
            avg_mmr=Avg("mmr_v"),
        )
        return Response(avg)


class IndividualVaccinationViewSet(viewsets.ModelViewSet):
    serializer_class = IndividualVaccinationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # During Swagger schema generation, drf_yasg calls this with AnonymousUser.
        # Return an empty queryset to avoid casting errors.
        if getattr(self, 'swagger_fake_view', False):
            return IndividualVaccinationRecord.objects.none()
        return IndividualVaccinationRecord.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)