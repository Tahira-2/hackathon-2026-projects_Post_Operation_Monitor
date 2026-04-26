from django.urls import path

from .views import (
    GetLocationView,
    LoginView,
    RegisterView,
    UpdateLocationView,
    UpdateProfileView,
    UploadProfilePhotoView,
    UserProfileView,
)

# Namespace for user-related URLs
app_name = "users"

# URL patterns for user-related endpoints
urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("me/", UserProfileView.as_view(), name="me"),
    path("me/update/", UpdateProfileView.as_view(), name="update_profile"),
    path("me/photo/", UploadProfilePhotoView.as_view(), name="upload_photo"),
    path("location/update/", UpdateLocationView.as_view(), name="update_location"),
    path("location/", GetLocationView.as_view(), name="get_location"),
]