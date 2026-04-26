from django.urls import path
from .views import EventViewSet, VaccinationViewSet

urlpatterns = [
    # Events - accessible to all authenticated users (read), medical personnel only (write)
    path(
        'events/',
        EventViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='event-list-create'
    ),
    path(
        'events/<uuid:pk>/',
        EventViewSet.as_view({
            'get': 'retrieve',
            'put': 'update',
            'patch': 'partial_update',
            'delete': 'destroy'
        }),
        name='event-detail'
    ),
    path(
        'events/my-notifications/',
        EventViewSet.as_view({'get': 'my_notifications'}),
        name='event-my-notifications'
    ),
    path(
        'events/<uuid:pk>/register/',
        EventViewSet.as_view({'post': 'register_for_event'}),
        name='event-register-for-event'
    ),

    # Vaccinations - medical personnel only
    path(
        'vaccinations/',
        VaccinationViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='vaccination-list-create'
    ),
    path(
        'vaccinations/<int:pk>/',
        VaccinationViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update'}),
        name='vaccination-detail'
    ),
]