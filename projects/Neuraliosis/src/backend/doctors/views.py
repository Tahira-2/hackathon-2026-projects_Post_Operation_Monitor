from datetime import datetime
from math import asin, cos, radians, sin, sqrt

from django.utils.dateparse import parse_datetime
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema

from hackathon_project.utils import ApiResponseAPIView, api_response

from .models import DoctorProfile
from .serializers import CreateDoctorSerializer, DoctorProfileSerializer


def _haversine_km(lat1, lng1, lat2, lng2):
    # Radius of Earth in kilometers
    earth_radius_km = 6371.0

    d_lat = radians(lat2 - lat1)
    d_lng = radians(lng2 - lng1)
    lat1 = radians(lat1)
    lat2 = radians(lat2)

    a = sin(d_lat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(d_lng / 2) ** 2
    c = 2 * asin(sqrt(a))
    return earth_radius_km * c


def _collect_error_messages(errors):
    if isinstance(errors, dict):
        messages = []
        for value in errors.values():
            messages.extend(_collect_error_messages(value))
        return messages

    if isinstance(errors, list):
        messages = []
        for item in errors:
            messages.extend(_collect_error_messages(item))
        return messages

    return [str(errors)]

class ListDoctorsView(ApiResponseAPIView):
    permission_classes = [AllowAny]

    @extend_schema(
        tags=["Doctors"],
        operation_id="doctors_list",
        responses={status.HTTP_200_OK: OpenApiTypes.OBJECT},
    )
    def get(self, request):
        doctors = DoctorProfile.objects.select_related("user").all()
        serializer = DoctorProfileSerializer(doctors, many=True)
        return api_response(
            result=serializer.data,
            is_success=True,
            status_code=status.HTTP_200_OK,
            error_message=[],
        )


class DoctorDetailView(ApiResponseAPIView):
    permission_classes = [AllowAny]

    @extend_schema(
        tags=["Doctors"],
        operation_id="doctors_detail",
        parameters=[
            OpenApiParameter(
                name="id",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description="Doctor profile ID.",
            )
        ],
        responses={status.HTTP_200_OK: OpenApiTypes.OBJECT},
    )
    def get(self, request, id):
        try:
            doctor = DoctorProfile.objects.select_related("user").get(id=id)
        except DoctorProfile.DoesNotExist:
            return api_response(
                result=None,
                is_success=False,
                status_code=status.HTTP_404_NOT_FOUND,
                error_message=["Doctor not found."],
            )

        serializer = DoctorProfileSerializer(doctor)
        return api_response(
            result=serializer.data,
            is_success=True,
            status_code=status.HTTP_200_OK,
            error_message=[],
        )


class NearbyDoctorsView(ApiResponseAPIView):
    permission_classes = [AllowAny]

    @extend_schema(
        tags=["Doctors"],
        parameters=[
            OpenApiParameter(
                name="lat",
                type=OpenApiTypes.FLOAT,
                location=OpenApiParameter.QUERY,
                required=True,
                description="Reference latitude.",
            ),
            OpenApiParameter(
                name="lng",
                type=OpenApiTypes.FLOAT,
                location=OpenApiParameter.QUERY,
                required=True,
                description="Reference longitude.",
            ),
        ],
        responses={status.HTTP_200_OK: OpenApiTypes.OBJECT},
    )
    def get(self, request):
        lat = request.query_params.get("lat")
        lng = request.query_params.get("lng")

        if lat is None or lng is None:
            return api_response(
                result=None,
                is_success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
                error_message=["lat and lng query parameters are required."],
            )

        try:
            lat = float(lat)
            lng = float(lng)
        except (TypeError, ValueError):
            return api_response(
                result=None,
                is_success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
                error_message=["lat and lng must be valid numbers."],
            )

        doctors = (
            DoctorProfile.objects.select_related("user")
            .exclude(latitude__isnull=True)
            .exclude(longitude__isnull=True)
        )

        doctor_data = []
        for doctor in doctors:
            distance_km = _haversine_km(
                lat,
                lng,
                float(doctor.latitude),
                float(doctor.longitude),
            )

            serialized = DoctorProfileSerializer(doctor).data
            serialized["distance_km"] = round(distance_km, 3)
            doctor_data.append(serialized)

        doctor_data.sort(key=lambda item: item["distance_km"])

        return api_response(
            result=doctor_data,
            is_success=True,
            status_code=status.HTTP_200_OK,
            error_message=[],
        )

class CreateDoctorView(ApiResponseAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CreateDoctorSerializer

    @extend_schema(
        tags=["Doctors"],
        request=CreateDoctorSerializer,
        responses={status.HTTP_201_CREATED: OpenApiTypes.OBJECT},
    )
    def post(self, request):
        if not request.user or not request.user.is_authenticated:
            return api_response(
                result=None,
                is_success=False,
                status_code=status.HTTP_401_UNAUTHORIZED,
                error_message=["Authentication credentials were not provided."],
            )

        if getattr(request.user, "role", None) != "admin":
            return api_response(
                result=None,
                is_success=False,
                status_code=status.HTTP_403_FORBIDDEN,
                error_message=["Only admin users can create doctor profiles."],
            )

        serializer = CreateDoctorSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                result=None,
                is_success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
                error_message=_collect_error_messages(serializer.errors),
            )

        doctor_profile = serializer.save()
        return api_response(
            result=DoctorProfileSerializer(doctor_profile).data,
            is_success=True,
            status_code=status.HTTP_201_CREATED,
            error_message=[],
        )


class DoctorAvailabilityView(ApiResponseAPIView):
    permission_classes = [AllowAny]

    @extend_schema(
        tags=["Doctors"],
        parameters=[
            OpenApiParameter(
                name="id",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description="Doctor profile ID.",
            ),
            OpenApiParameter(
                name="datetime",
                type=OpenApiTypes.DATETIME,
                location=OpenApiParameter.QUERY,
                required=True,
                description="Datetime to check availability (ISO-8601).",
            ),
            OpenApiParameter(
                name="date_time",
                type=OpenApiTypes.DATETIME,
                location=OpenApiParameter.QUERY,
                required=False,
                description="Alternate datetime query key (ISO-8601).",
            ),
        ],
        responses={status.HTTP_200_OK: OpenApiTypes.OBJECT},
    )
    def get(self, request, id):
        # Support both `datetime` and `date_time` query key variants.
        date_time_str = request.query_params.get("datetime") or request.query_params.get("date_time")
        if not date_time_str:
            return api_response(
                result=None,
                is_success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
                error_message=["datetime query parameter is required."],
            )

        parsed_datetime = parse_datetime(date_time_str)
        if parsed_datetime is None:
            try:
                parsed_datetime = datetime.fromisoformat(date_time_str)
            except ValueError:
                return api_response(
                    result=None,
                    is_success=False,
                    status_code=status.HTTP_400_BAD_REQUEST,
                    error_message=["datetime must be a valid ISO-8601 datetime."],
                )

        doctor_id = request.query_params.get("id", id)
        try:
            doctor_id = int(doctor_id)
        except (TypeError, ValueError):
            return api_response(
                result=None,
                is_success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
                error_message=["id must be a valid integer."],
            )

        try:
            doctor = DoctorProfile.objects.get(id=doctor_id)
        except DoctorProfile.DoesNotExist:
            return api_response(
                result=None,
                is_success=False,
                status_code=status.HTTP_404_NOT_FOUND,
                error_message=["Doctor not found."],
            )

        target_time = parsed_datetime.time()
        is_available = doctor.available_from <= target_time <= doctor.available_to

        return api_response(
            result={"is_available": is_available},
            is_success=True,
            status_code=status.HTTP_200_OK,
            error_message=[],
        )
