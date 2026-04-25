from django.urls import path

from .views import ReportDetailView, ReportListView, ReportUploadView

urlpatterns = [
    path("upload/", ReportUploadView.as_view(), name="report-upload"),
    path("", ReportListView.as_view(), name="report-list"),
    path("<int:id>/", ReportDetailView.as_view(), name="report-detail"),
]
