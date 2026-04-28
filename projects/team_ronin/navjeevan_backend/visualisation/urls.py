from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DistrictViewSet, CoverageViewSet, IndividualVaccinationViewSet

router = DefaultRouter()
router.register(r"districts", DistrictViewSet, basename="district")
router.register(r"coverage", CoverageViewSet, basename="coverage")
router.register(r"my-vaccinations", IndividualVaccinationViewSet, basename="my-vaccinations")

urlpatterns = [
    path("api/", include(router.urls)),
]