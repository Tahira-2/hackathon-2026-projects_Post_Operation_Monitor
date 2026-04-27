from django.urls import path

from .views import UploadSessionView

urlpatterns = [
    path("upload-session/", UploadSessionView.as_view(), name="upload-session"),
]
