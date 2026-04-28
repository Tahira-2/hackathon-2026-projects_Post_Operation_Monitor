from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VaccineViewSet, IndividualVaccinationRecordViewSet

router = DefaultRouter()
router.register(r'vaccines', VaccineViewSet, basename='vaccine')
router.register(r'my-records', IndividualVaccinationRecordViewSet, basename='my-record')

urlpatterns = [
    path('', include(router.urls)),
]
