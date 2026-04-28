from datetime import date

from rest_framework import viewsets, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.db.models import Avg
from user.models import NormalUser

from .models import District, VaccinationRecord, IndividualVaccinationRecord
from .serializers import (
    DistrictSerializer,
    VaccinationRecordSerializer,
    CoverageMapSerializer,
    DistrictDetailSerializer,
    IndividualVaccinationSerializer,
)
from .services.ai_service import get_district_insight, get_user_assistant_response


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

    @staticmethod
    def _record_in_year(record, year):
        if record.date_administered:
            return record.date_administered.year == year
        return record.created_at.year == year

    @staticmethod
    def _vaccine_name(value):
        return (value or "").strip().lower()

    def _build_live_summary_for_district(self, district, year):
        records = [
            item
            for item in IndividualVaccinationRecord.objects.filter(district=district)
            if self._record_in_year(item, year)
        ]

        def count_completed(name_tokens, dose_number=None):
            total = 0
            for row in records:
                if row.status != "completed":
                    continue
                if dose_number is not None and row.dose_number != dose_number:
                    continue
                vaccine_name = self._vaccine_name(row.vaccine_name)
                if any(token in vaccine_name for token in name_tokens):
                    total += 1
            return total

        bcg = count_completed(["bcg"])
        dpt_3 = count_completed(["dpt", "penta"], dose_number=3)
        penta_3 = count_completed(["penta"], dose_number=3)
        opv_3 = count_completed(["opv"], dose_number=3)
        hep_b3 = count_completed(["hep"], dose_number=3)
        meas_1 = count_completed(["measles", "mr"], dose_number=1)
        mmr_v = count_completed(["mmr", "mr"])

        base = bcg or 1
        coverage_pct = round((dpt_3 / base) * 100, 1) if bcg else 0.0
        vaccine_breakdown = {
            "BCG": 100.0 if bcg else 0.0,
            "DPT-3": round((dpt_3 / base) * 100, 1),
            "Penta-3": round((penta_3 / base) * 100, 1),
            "OPV-3": round((opv_3 / base) * 100, 1),
            "HepB-3": round((hep_b3 / base) * 100, 1),
            "Measles-1": round((meas_1 / base) * 100, 1),
            "MMR": round((mmr_v / base) * 100, 1),
        }

        return {
            "district": district.id,
            "district_name": district.name,
            "province": district.province,
            "imr": district.imr_classification,
            "population": district.population,
            "year": year,
            "coverage_pct": coverage_pct,
            "vaccine_breakdown": vaccine_breakdown,
            "bcg": bcg,
            "dpt_3": dpt_3,
            "penta_3": penta_3,
            "opv_3": opv_3,
            "hep_b3": hep_b3,
            "meas_1": meas_1,
            "mmr_v": mmr_v,
        }

    def _build_live_coverage(self, year, district_id=None):
        districts_qs = District.objects.all()
        if district_id:
            districts_qs = districts_qs.filter(id=district_id)
        return [self._build_live_summary_for_district(item, year) for item in districts_qs]

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

    def list(self, request, *args, **kwargs):
        year = request.query_params.get("year")
        if year:
            selected_year = int(year)
            if selected_year == date.today().year:
                live_rows = self._build_live_coverage(selected_year)
                return Response(live_rows)
        return super().list(request, *args, **kwargs)

    def get_serializer_class(self):
        if self.action == "list":
            return CoverageMapSerializer
        return DistrictDetailSerializer

    @action(detail=False, methods=["get"], url_path="years")
    def years(self, request):
        """GET /api/coverage/years/ — returns sorted list of available years."""
        years = set(
            VaccinationRecord.objects
            .values_list("year", flat=True)
            .distinct()
        )
        live_years = set(
            IndividualVaccinationRecord.objects.values_list("created_at__year", flat=True).distinct()
        )
        all_years = sorted(years.union(live_years))
        return Response(all_years)

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
        payload = list(serializer.data)

        current_year = date.today().year
        has_current = any(item.get("year") == current_year for item in payload)
        if not has_current:
            district = District.objects.filter(id=pk).first()
            if district:
                payload.append(self._build_live_summary_for_district(district, current_year))
                payload = sorted(payload, key=lambda item: item.get("year", 0))

        return Response(payload)

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

    @action(detail=True, methods=["post"], url_path="insight")
    def insight(self, request, pk=None):
        year = int(request.data.get("year", 2024))
        question = request.data.get("question")
        language = request.data.get("language", "en")

        try:
            insight_text = get_district_insight(
                district_id=int(pk),
                year=year,
                user_question=question,
                language=language,
            )
        except VaccinationRecord.DoesNotExist:
            return Response({"detail": "No district data found for selected year."}, status=404)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=400)
        except Exception:
            return Response({"detail": "Could not generate AI insight right now."}, status=503)

        return Response({"insight": insight_text})


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

    @action(detail=False, methods=["post"], url_path="assistant")
    def assistant(self, request):
        question = (request.data.get("question") or "").strip()
        language = (request.data.get("language") or "en").strip().lower()
        if not question:
            return Response({"detail": "Question is required."}, status=400)

        if not isinstance(request.user, NormalUser):
            return Response({"detail": "Only normal users can use this assistant."}, status=403)

        try:
            answer = get_user_assistant_response(user=request.user, question=question, language=language)
            return Response({"answer": answer})
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=400)
        except Exception:
            return Response({"detail": "Could not generate assistant response right now."}, status=503)