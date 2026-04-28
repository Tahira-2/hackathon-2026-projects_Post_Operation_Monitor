from datetime import datetime

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema

from hackathon_project.utils import ApiResponseAPIView, api_response

from .models import Appointment, AppointmentSlot, AppointmentReport
from .serializers import (
    AppointmentSerializer,
    AppointmentSlotSerializer,
    AppointmentReportSerializer,
    BookAppointmentSerializer,
    CreateSlotSerializer,
    CreateReportSerializer,
    UpdateAppointmentSerializer,
    UpdateAppointmentStatusSerializer,
)


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


# ─── Patient: Book + List ───

class BookAppointmentView(ApiResponseAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BookAppointmentSerializer

    @extend_schema(tags=["Appointments"], request=BookAppointmentSerializer, responses={status.HTTP_201_CREATED: OpenApiTypes.OBJECT})
    def post(self, request):
        try:
            serializer = BookAppointmentSerializer(data=request.data)
            if not serializer.is_valid():
                return api_response(result=None, is_success=False, status_code=status.HTTP_400_BAD_REQUEST, error_message=_collect_error_messages(serializer.errors))

            slot = serializer.validated_data.get("slot")
            if slot:
                if slot.is_booked:
                    return api_response(result=None, is_success=False, status_code=status.HTTP_400_BAD_REQUEST, error_message=["This slot is already booked."])
                slot.is_booked = True
                slot.save(update_fields=["is_booked"])

            appointment = serializer.save(user=request.user, status=Appointment.Status.PENDING)
            return api_response(result=AppointmentSerializer(appointment).data, is_success=True, status_code=status.HTTP_201_CREATED, error_message=[])
        except Exception:
            return api_response(result=None, is_success=False, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, error_message=["An unexpected error occurred while booking the appointment."])


class MyAppointmentsView(ApiResponseAPIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["Appointments"], responses={status.HTTP_200_OK: OpenApiTypes.OBJECT})
    def get(self, request):
        appointments = (
            Appointment.objects.select_related("doctor", "doctor__user")
            .filter(user=request.user)
            .order_by("-created_at")
        )
        serializer = AppointmentSerializer(appointments, many=True)
        return api_response(result=serializer.data, is_success=True, status_code=status.HTTP_200_OK, error_message=[])


class AppointmentCollectionView(BookAppointmentView, MyAppointmentsView):
    """POST = book, GET = list mine."""
    pass


# ─── Patient/Doctor: Update ───

class UpdateAppointmentView(ApiResponseAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UpdateAppointmentSerializer

    @extend_schema(tags=["Appointments"], request=UpdateAppointmentSerializer(partial=True), responses={status.HTTP_200_OK: OpenApiTypes.OBJECT})
    def patch(self, request, id):
        try:
            appointment = Appointment.objects.select_related("doctor", "doctor__user").get(id=id)
        except Appointment.DoesNotExist:
            return api_response(result=None, is_success=False, status_code=status.HTTP_404_NOT_FOUND, error_message=["Appointment not found."])

        if appointment.user_id != request.user.id:
            return api_response(result=None, is_success=False, status_code=status.HTTP_403_FORBIDDEN, error_message=["You can only update your own appointments."])

        serializer = UpdateAppointmentSerializer(appointment, data=request.data, partial=True)
        if not serializer.is_valid():
            return api_response(result=None, is_success=False, status_code=status.HTTP_400_BAD_REQUEST, error_message=_collect_error_messages(serializer.errors))

        updated = serializer.save()
        return api_response(result=AppointmentSerializer(updated).data, is_success=True, status_code=status.HTTP_200_OK, error_message=[])


class UpdateAppointmentStatusView(ApiResponseAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UpdateAppointmentStatusSerializer

    @extend_schema(tags=["Appointments"], request=UpdateAppointmentStatusSerializer, responses={status.HTTP_200_OK: OpenApiTypes.OBJECT})
    def patch(self, request, id):
        try:
            appointment = Appointment.objects.select_related("doctor", "doctor__user").get(id=id)
        except Appointment.DoesNotExist:
            return api_response(result=None, is_success=False, status_code=status.HTTP_404_NOT_FOUND, error_message=["Appointment not found."])

        role = getattr(request.user, "role", None)
        if role not in {"doctor", "admin"}:
            return api_response(result=None, is_success=False, status_code=status.HTTP_403_FORBIDDEN, error_message=["Only doctor or admin users can update appointment status."])

        if role == "doctor" and appointment.doctor.user_id != request.user.id:
            return api_response(result=None, is_success=False, status_code=status.HTTP_403_FORBIDDEN, error_message=["Doctors can only update status for their own appointments."])

        s = UpdateAppointmentStatusSerializer(data=request.data)
        if not s.is_valid():
            return api_response(result=None, is_success=False, status_code=status.HTTP_400_BAD_REQUEST, error_message=_collect_error_messages(s.errors))

        appointment.status = s.validated_data["status"]
        appointment.save(update_fields=["status"])
        return api_response(result=AppointmentSerializer(appointment).data, is_success=True, status_code=status.HTTP_200_OK, error_message=[])


# ─── Doctor: Slot management ───

class DoctorSlotsView(ApiResponseAPIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["Appointments"], responses={status.HTTP_200_OK: OpenApiTypes.OBJECT})
    def get(self, request):
        doctor_profile = getattr(request.user, "doctor_profile", None)
        if not doctor_profile:
            return api_response(result=None, is_success=False, status_code=status.HTTP_403_FORBIDDEN, error_message=["Only doctors can manage slots."])

        slots = AppointmentSlot.objects.filter(doctor=doctor_profile)
        return api_response(result=AppointmentSlotSerializer(slots, many=True).data, is_success=True, status_code=status.HTTP_200_OK, error_message=[])

    @extend_schema(tags=["Appointments"], request=CreateSlotSerializer, responses={status.HTTP_201_CREATED: OpenApiTypes.OBJECT})
    def post(self, request):
        doctor_profile = getattr(request.user, "doctor_profile", None)
        if not doctor_profile:
            return api_response(result=None, is_success=False, status_code=status.HTTP_403_FORBIDDEN, error_message=["Only doctors can create slots."])

        serializer = CreateSlotSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(result=None, is_success=False, status_code=status.HTTP_400_BAD_REQUEST, error_message=_collect_error_messages(serializer.errors))

        slot = AppointmentSlot.objects.create(doctor=doctor_profile, **serializer.validated_data)
        return api_response(result=AppointmentSlotSerializer(slot).data, is_success=True, status_code=status.HTTP_201_CREATED, error_message=[])


class DeleteSlotView(ApiResponseAPIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["Appointments"])
    def delete(self, request, id):
        doctor_profile = getattr(request.user, "doctor_profile", None)
        if not doctor_profile:
            return api_response(result=None, is_success=False, status_code=status.HTTP_403_FORBIDDEN, error_message=["Only doctors can delete slots."])

        try:
            slot = AppointmentSlot.objects.get(id=id, doctor=doctor_profile)
        except AppointmentSlot.DoesNotExist:
            return api_response(result=None, is_success=False, status_code=status.HTTP_404_NOT_FOUND, error_message=["Slot not found."])

        if slot.is_booked:
            return api_response(result=None, is_success=False, status_code=status.HTTP_400_BAD_REQUEST, error_message=["Cannot delete a booked slot."])

        slot.delete()
        return api_response(result=None, is_success=True, status_code=status.HTTP_204_NO_CONTENT, error_message=[])


class AvailableSlotsView(ApiResponseAPIView):
    """Public: list unbooked slots for a doctor."""

    @extend_schema(tags=["Appointments"], responses={status.HTTP_200_OK: OpenApiTypes.OBJECT})
    def get(self, request, doctor_id):
        slots = AppointmentSlot.objects.filter(doctor_id=doctor_id, is_booked=False)
        return api_response(result=AppointmentSlotSerializer(slots, many=True).data, is_success=True, status_code=status.HTTP_200_OK, error_message=[])


# ─── Doctor: My Appointments ───

class DoctorAppointmentsView(ApiResponseAPIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["Appointments"], responses={status.HTTP_200_OK: OpenApiTypes.OBJECT})
    def get(self, request):
        doctor_profile = getattr(request.user, "doctor_profile", None)
        if not doctor_profile:
            return api_response(result=None, is_success=False, status_code=status.HTTP_403_FORBIDDEN, error_message=["Only doctors can view their appointments."])

        appointments = Appointment.objects.filter(doctor=doctor_profile).select_related("doctor", "doctor__user").order_by("-created_at")
        return api_response(result=AppointmentSerializer(appointments, many=True).data, is_success=True, status_code=status.HTTP_200_OK, error_message=[])


# ─── Reports ───

class AppointmentReportView(ApiResponseAPIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    @extend_schema(tags=["Appointments"], responses={status.HTTP_200_OK: OpenApiTypes.OBJECT})
    def get(self, request, id):
        try:
            appointment = Appointment.objects.get(id=id)
        except Appointment.DoesNotExist:
            return api_response(result=None, is_success=False, status_code=status.HTTP_404_NOT_FOUND, error_message=["Appointment not found."])

        # Allow patient or doctor to view
        is_patient = appointment.user_id == request.user.id
        is_doctor = hasattr(request.user, "doctor_profile") and appointment.doctor.user_id == request.user.id
        if not is_patient and not is_doctor:
            return api_response(result=None, is_success=False, status_code=status.HTTP_403_FORBIDDEN, error_message=["Access denied."])

        try:
            report = appointment.report
        except AppointmentReport.DoesNotExist:
            return api_response(result=None, is_success=False, status_code=status.HTTP_404_NOT_FOUND, error_message=["No report for this appointment."])

        return api_response(result=AppointmentReportSerializer(report).data, is_success=True, status_code=status.HTTP_200_OK, error_message=[])

    @extend_schema(tags=["Appointments"], request=CreateReportSerializer, responses={status.HTTP_201_CREATED: OpenApiTypes.OBJECT})
    def post(self, request, id):
        doctor_profile = getattr(request.user, "doctor_profile", None)
        if not doctor_profile:
            return api_response(result=None, is_success=False, status_code=status.HTTP_403_FORBIDDEN, error_message=["Only doctors can create reports."])

        try:
            appointment = Appointment.objects.get(id=id, doctor=doctor_profile)
        except Appointment.DoesNotExist:
            return api_response(result=None, is_success=False, status_code=status.HTTP_404_NOT_FOUND, error_message=["Appointment not found."])

        serializer = CreateReportSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(result=None, is_success=False, status_code=status.HTTP_400_BAD_REQUEST, error_message=_collect_error_messages(serializer.errors))

        report_file = request.FILES.get("report_file")
        report, created = AppointmentReport.objects.update_or_create(
            appointment=appointment,
            defaults={**serializer.validated_data, "report_file": report_file} if report_file else serializer.validated_data,
        )

        return api_response(
            result=AppointmentReportSerializer(report).data,
            is_success=True,
            status_code=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
            error_message=[],
        )