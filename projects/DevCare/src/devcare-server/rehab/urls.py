from django.urls import path

from .views import (
    ExerciseTemplateListView,
    ExerciseTemplateCreateView,
    RehabPlanCreateView,
    RehabPlanDetailView,
    SessionCompleteView,
    SessionStartView,
    RehabPlanGenerateView,
    CareBotAIView,
)

urlpatterns = [
    path("exercises/", ExerciseTemplateListView.as_view(), name="rehab-exercises-list"),
    path("exercises/create/", ExerciseTemplateCreateView.as_view(), name="rehab-exercises-create"),
    path("plans/", RehabPlanCreateView.as_view(), name="rehab-plan-create"),
    path("plans/generate/", RehabPlanGenerateView.as_view(), name="rehab-plan-generate"),
    path("plans/<int:plan_id>/", RehabPlanDetailView.as_view(), name="rehab-plan-detail"),
    path("sessions/start/", SessionStartView.as_view(), name="rehab-session-start"),
    path(
        "sessions/<int:session_id>/complete/",
        SessionCompleteView.as_view(),
        name="rehab-session-complete",
    ),
    path("chatbot/", CareBotAIView.as_view(), name="rehab-chatbot"),
]
