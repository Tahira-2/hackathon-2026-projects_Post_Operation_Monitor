from django.urls import path
from .views import ReportListCreateView

urlpatterns = [
    path('', ReportListCreateView.as_view()),
    path('upload/', ReportListCreateView.as_view()),
]