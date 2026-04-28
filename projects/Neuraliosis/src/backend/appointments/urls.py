from django.urls import path

from .views import (
    AppointmentCollectionView,
    AppointmentReportView,
    AvailableSlotsView,
    DeleteSlotView,
    DoctorAppointmentsView,
    DoctorSlotsView,
    UpdateAppointmentStatusView,
    UpdateAppointmentView,
)

app_name = "appointments"

urlpatterns = [
    path("", AppointmentCollectionView.as_view(), name="appointments_root"),
    path("<int:id>/", UpdateAppointmentView.as_view(), name="update_appointment"),
    path("<int:id>/status/", UpdateAppointmentStatusView.as_view(), name="update_appointment_status"),
    path("<int:id>/report/", AppointmentReportView.as_view(), name="appointment_report"),
    path("slots/", DoctorSlotsView.as_view(), name="doctor_slots"),
    path("slots/<int:id>/", DeleteSlotView.as_view(), name="delete_slot"),
    path("available/<int:doctor_id>/", AvailableSlotsView.as_view(), name="available_slots"),
    path("doctor/", DoctorAppointmentsView.as_view(), name="doctor_appointments"),
]