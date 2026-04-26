from django.urls import path

from .views import (
    CreateDoctorView,
    DoctorAvailabilityView,
    DoctorDetailView,
    ListDoctorsView,
    NearbyDoctorsView,
)

# URL configuration for the doctors app
app_name = "doctors"

# URL patterns for the doctors app
urlpatterns = [
    path("", ListDoctorsView.as_view(), name="list_doctors"),
    path("create/", CreateDoctorView.as_view(), name="create_doctor"),
    path("nearby/", NearbyDoctorsView.as_view(), name="nearby_doctors"),
    path("<int:id>/", DoctorDetailView.as_view(), name="doctor_detail"),
    path("<int:id>/availability/", DoctorAvailabilityView.as_view(), name="doctor_availability"),
]
