from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema

from hackathon_project.utils import ApiResponseAPIView, api_response

from .models import Appointment
from .serializers import (
	AppointmentSerializer,
	BookAppointmentSerializer,
	UpdateAppointmentSerializer,
	UpdateAppointmentStatusSerializer,
)

# Helper function to recursively collect error messages from serializer errors
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

# API Views
class BookAppointmentView(ApiResponseAPIView):
	permission_classes = [IsAuthenticated]
	serializer_class = BookAppointmentSerializer

	@extend_schema(
		tags=["Appointments"],
		operation_id="appointments_book",
		request=BookAppointmentSerializer,
		responses={status.HTTP_201_CREATED: OpenApiTypes.OBJECT},
	)
	def post(self, request):
		try:
			serializer = BookAppointmentSerializer(data=request.data)
			if not serializer.is_valid():
				return api_response(
					result=None,
					is_success=False,
					status_code=status.HTTP_400_BAD_REQUEST,
					error_message=_collect_error_messages(serializer.errors),
				)

			appointment = serializer.save(user=request.user, status=Appointment.Status.PENDING)
			return api_response(
				result=AppointmentSerializer(appointment).data,
				is_success=True,
				status_code=status.HTTP_201_CREATED,
				error_message=[],
			)
		except Exception:
			return api_response(
				result=None,
				is_success=False,
				status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
				error_message=["An unexpected error occurred while booking the appointment."],
			)


class MyAppointmentsView(ApiResponseAPIView):
	permission_classes = [IsAuthenticated]

	@extend_schema(
		tags=["Appointments"],
		operation_id="appointments_list_mine",
		responses={status.HTTP_200_OK: OpenApiTypes.OBJECT},
	)
	def get(self, request):
		try:
			appointments = (
				Appointment.objects.select_related("doctor", "doctor__user")
				.filter(user=request.user)
				.order_by("-created_at")
			)
			serializer = AppointmentSerializer(appointments, many=True)
			return api_response(
				result=serializer.data,
				is_success=True,
				status_code=status.HTTP_200_OK,
				error_message=[],
			)
		except Exception:
			return api_response(
				result=None,
				is_success=False,
				status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
				error_message=["An unexpected error occurred while fetching appointments."],
			)


class UpdateAppointmentView(ApiResponseAPIView):
	permission_classes = [IsAuthenticated]
	serializer_class = UpdateAppointmentSerializer

	@extend_schema(
		tags=["Appointments"],
		operation_id="appointments_update",
		parameters=[
			OpenApiParameter(
				name="id",
				type=OpenApiTypes.INT,
				location=OpenApiParameter.PATH,
				description="Appointment ID.",
			)
		],
		request=UpdateAppointmentSerializer(partial=True),
		responses={status.HTTP_200_OK: OpenApiTypes.OBJECT},
	)
	def patch(self, request, id):
		try:
			try:
				appointment = Appointment.objects.select_related("doctor", "doctor__user").get(id=id)
			except Appointment.DoesNotExist:
				return api_response(
					result=None,
					is_success=False,
					status_code=status.HTTP_404_NOT_FOUND,
					error_message=["Appointment not found."],
				)

			if appointment.user_id != request.user.id:
				return api_response(
					result=None,
					is_success=False,
					status_code=status.HTTP_403_FORBIDDEN,
					error_message=["You can only update your own appointments."],
				)

			serializer = UpdateAppointmentSerializer(appointment, data=request.data, partial=True)
			if not serializer.is_valid():
				return api_response(
					result=None,
					is_success=False,
					status_code=status.HTTP_400_BAD_REQUEST,
					error_message=_collect_error_messages(serializer.errors),
				)

			requested_status = serializer.validated_data.get("status")
			if requested_status and requested_status not in {
				Appointment.Status.PENDING,
				Appointment.Status.CANCELLED,
			}:
				return api_response(
					result=None,
					is_success=False,
					status_code=status.HTTP_400_BAD_REQUEST,
					error_message=["Status can only be updated to pending or cancelled from this endpoint."],
				)

			updated_appointment = serializer.save()
			return api_response(
				result=AppointmentSerializer(updated_appointment).data,
				is_success=True,
				status_code=status.HTTP_200_OK,
				error_message=[],
			)
		except Exception:
			return api_response(
				result=None,
				is_success=False,
				status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
				error_message=["An unexpected error occurred while updating the appointment."],
			)


class UpdateAppointmentStatusView(ApiResponseAPIView):
	permission_classes = [IsAuthenticated]
	serializer_class = UpdateAppointmentStatusSerializer

	@extend_schema(
		tags=["Appointments"],
		operation_id="appointments_update_status",
		parameters=[
			OpenApiParameter(
				name="id",
				type=OpenApiTypes.INT,
				location=OpenApiParameter.PATH,
				description="Appointment ID.",
			)
		],
		request=UpdateAppointmentStatusSerializer,
		responses={status.HTTP_200_OK: OpenApiTypes.OBJECT},
	)
	def patch(self, request, id):
		try:
			try:
				appointment = Appointment.objects.select_related("doctor", "doctor__user").get(id=id)
			except Appointment.DoesNotExist:
				return api_response(
					result=None,
					is_success=False,
					status_code=status.HTTP_404_NOT_FOUND,
					error_message=["Appointment not found."],
				)

			role = getattr(request.user, "role", None)
			if role not in {"doctor", "admin"}:
				return api_response(
					result=None,
					is_success=False,
					status_code=status.HTTP_403_FORBIDDEN,
					error_message=["Only doctor or admin users can update appointment status."],
				)

			if role == "doctor" and appointment.doctor.user_id != request.user.id:
				return api_response(
					result=None,
					is_success=False,
					status_code=status.HTTP_403_FORBIDDEN,
					error_message=["Doctors can only update status for their own appointments."],
				)

			status_serializer = UpdateAppointmentStatusSerializer(data=request.data)
			if not status_serializer.is_valid():
				return api_response(
					result=None,
					is_success=False,
					status_code=status.HTTP_400_BAD_REQUEST,
					error_message=_collect_error_messages(status_serializer.errors),
				)

			appointment.status = status_serializer.validated_data["status"]
			appointment.save(update_fields=["status"])

			return api_response(
				result=AppointmentSerializer(appointment).data,
				is_success=True,
				status_code=status.HTTP_200_OK,
				error_message=[],
			)
		except Exception:
			return api_response(
				result=None,
				is_success=False,
				status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
				error_message=["An unexpected error occurred while updating appointment status."],
			)


class AppointmentCollectionView(BookAppointmentView, MyAppointmentsView):
	"""Supports POST (book) and GET (list mine) on the same root endpoint."""
	pass