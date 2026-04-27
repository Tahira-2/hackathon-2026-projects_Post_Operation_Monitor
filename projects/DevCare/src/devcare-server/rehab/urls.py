from django.urls import path

from .views import (
    ExerciseTemplateListView,
    ExerciseTemplateCreateView,
    RehabPlanCreateView,
    RehabPlanDetailView,
    SessionCompleteView,
    SessionStartView,
    PatientPlanListView,
    PatientPlanListView,
    MySessionHistoryView,
    SessionDetailView,
    PatientSessionHistoryView,
    DoctorFeedbackCreateView,
    DashboardStatsView,
)

urlpatterns = [
    path("exercises/", ExerciseTemplateListView.as_view(), name="rehab-exercises-list"),
    path("exercises/create/", ExerciseTemplateCreateView.as_view(), name="rehab-exercises-create"),
    path("plans/", RehabPlanCreateView.as_view(), name="rehab-plan-create"),
    path("plans/<int:plan_id>/", RehabPlanDetailView.as_view(), name="rehab-plan-detail"),
    path("plans/my/", PatientPlanListView.as_view(), name="rehab-my-plans"),
    path("sessions/start/", SessionStartView.as_view(), name="rehab-session-start"),
    path("sessions/history/", MySessionHistoryView.as_view(), name="rehab-session-history"),
    path("patient-sessions/<int:patient_id>/", PatientSessionHistoryView.as_view(), name="rehab-patient-sessions"),
    path("sessions/<int:session_id>/", SessionDetailView.as_view(), name="rehab-session-detail"),
    path("feedback/", DoctorFeedbackCreateView.as_view(), name="rehab-feedback"),
    path(
        "sessions/<int:session_id>/complete/",
        SessionCompleteView.as_view(),
        name="rehab-session-complete",
    ),
    path("dashboard-stats/", DashboardStatsView.as_view(), name="rehab-dashboard-stats"),
]
