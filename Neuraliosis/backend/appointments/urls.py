from django.urls import path

from .views import (
    AppointmentCollectionView,
    UpdateAppointmentStatusView,
    UpdateAppointmentView,
)

app_name = "appointments"

urlpatterns = [
    path("", AppointmentCollectionView.as_view(), name="appointments_root"),
    path("<int:id>/", UpdateAppointmentView.as_view(), name="update_appointment"),
    path("<int:id>/status/", UpdateAppointmentStatusView.as_view(), name="update_appointment_status"),
]