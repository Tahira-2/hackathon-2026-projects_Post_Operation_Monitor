from django.urls import path

from .views import (
    ExerciseTemplateListView,
    RehabPlanCreateView,
    RehabPlanDetailView,
    SessionCompleteView,
    SessionStartView,
)

urlpatterns = [
    path("exercises/", ExerciseTemplateListView.as_view(), name="rehab-exercises-list"),
    path("plans/", RehabPlanCreateView.as_view(), name="rehab-plan-create"),
    path("plans/<int:plan_id>/", RehabPlanDetailView.as_view(), name="rehab-plan-detail"),
    path("sessions/start/", SessionStartView.as_view(), name="rehab-session-start"),
    path(
        "sessions/<int:session_id>/complete/",
        SessionCompleteView.as_view(),
        name="rehab-session-complete",
    ),
]
