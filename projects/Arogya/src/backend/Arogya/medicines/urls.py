from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MedicineViewSet

router = DefaultRouter()
router.register('', MedicineViewSet, basename='medicine')

urlpatterns = [
    path('', include(router.urls)),
]