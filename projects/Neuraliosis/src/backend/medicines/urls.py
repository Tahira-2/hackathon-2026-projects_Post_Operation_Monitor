from django.urls import path
from .views import ListMedicinesView, MedicineDetailView

app_name = "medicines"

urlpatterns = [
    path("", ListMedicinesView.as_view(), name="list_medicines"),
    path("<int:id>/", MedicineDetailView.as_view(), name="medicine_detail"),
]
