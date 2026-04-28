from django.urls import path
from .views import DoctorListView, NearbyDoctorView

urlpatterns = [
    path('', DoctorListView.as_view()),
    path('nearby/', NearbyDoctorView.as_view()),
]