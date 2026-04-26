from rest_framework import serializers, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema

from hackathon_project.utils import ApiResponseAPIView, api_response

from .serializers import LoginSerializer, RegisterSerializer, UserProfileSerializer

# Helper function to recursively collect error messages from serializer errors
def _collect_error_messages(errors):
    if isinstance(errors, dict):
        messages = []
        for value in errors.values():
            messages.extend(_collect_error_messages(value))
        return messages

    if isinstance(errors, list):
        messages = []
        for item in errors:
            messages.extend(_collect_error_messages(item))
        return messages

    return [str(errors)]

# Serializer for updating user location
class UpdateLocationSerializer(serializers.Serializer):
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6)

# Views for user registration, login, profile retrieval, profile update, location update, and location retrieval
class RegisterView(ApiResponseAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    @extend_schema(request=RegisterSerializer, tags=["Users"])
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                result=None,
                is_success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
                error_message=_collect_error_messages(serializer.errors),
            )

        user = serializer.save()
        user_data = UserProfileSerializer(user, context={"request": request}).data
        return api_response(
            result=user_data,
            is_success=True,
            status_code=status.HTTP_201_CREATED,
            error_message=[],
        )

# View for user login, which returns JWT tokens upon successful authentication
class LoginView(ApiResponseAPIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    @extend_schema(request=LoginSerializer, tags=["Users"])
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        if not serializer.is_valid():
            error_messages = _collect_error_messages(serializer.errors)
            login_errors = {"Invalid email or password.", "User account is disabled."}
            status_code = (
                status.HTTP_401_UNAUTHORIZED
                if any(message in login_errors for message in error_messages)
                else status.HTTP_400_BAD_REQUEST
            )
            return api_response(
                result=None,
                is_success=False,
                status_code=status_code,
                error_message=error_messages,
            )

        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)
        return api_response(
            result={
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status_code=status.HTTP_200_OK,
            is_success=True,
            error_message=[],
        )

# View for retrieving the authenticated user's profile information
class UserProfileView(ApiResponseAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    @extend_schema(tags=["Users"])
    def get(self, request):
        if not request.user or not request.user.is_authenticated:
            return api_response(
                result=None,
                is_success=False,
                status_code=status.HTTP_401_UNAUTHORIZED,
                error_message=["Authentication credentials were not provided."],
            )

        serializer = UserProfileSerializer(request.user, context={"request": request})
        return api_response(
            result=serializer.data,
            is_success=True,
            status_code=status.HTTP_200_OK,
            error_message=[],
        )

# View for updating the authenticated user's profile information, allowing partial updates
class UpdateProfileView(ApiResponseAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    @extend_schema(request=UserProfileSerializer(partial=True), tags=["Users"])
    def patch(self, request):
        if not request.user or not request.user.is_authenticated:
            return api_response(
                result=None,
                is_success=False,
                status_code=status.HTTP_401_UNAUTHORIZED,
                error_message=["Authentication credentials were not provided."],
            )

        serializer = UserProfileSerializer(request.user, data=request.data, partial=True, context={"request": request})
        if not serializer.is_valid():
            return api_response(
                result=None,
                is_success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
                error_message=_collect_error_messages(serializer.errors),
            )

        serializer.save()
        return api_response(
            result=serializer.data,
            is_success=True,
            status_code=status.HTTP_200_OK,
            error_message=[],
        )

# View for updating the authenticated user's location (latitude and longitude)
class UpdateLocationView(ApiResponseAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UpdateLocationSerializer

    @extend_schema(request=UpdateLocationSerializer(partial=True), tags=["Users"])
    def patch(self, request):
        if not request.user or not request.user.is_authenticated:
            return api_response(
                result=None,
                is_success=False,
                status_code=status.HTTP_401_UNAUTHORIZED,
                error_message=["Authentication credentials were not provided."],
            )

        serializer = UpdateLocationSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                result=None,
                is_success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
                error_message=_collect_error_messages(serializer.errors),
            )

        request.user.latitude = serializer.validated_data["latitude"]
        request.user.longitude = serializer.validated_data["longitude"]
        request.user.save(update_fields=["latitude", "longitude"])

        return api_response(
            result={
                "latitude": request.user.latitude,
                "longitude": request.user.longitude,
            },
            is_success=True,
            status_code=status.HTTP_200_OK,
            error_message=[],
        )

# View for retrieving the authenticated user's current location (latitude and longitude)
class GetLocationView(ApiResponseAPIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["Users"], responses={status.HTTP_200_OK: OpenApiTypes.OBJECT})
    def get(self, request):
        if not request.user or not request.user.is_authenticated:
            return api_response(
                result=None,
                is_success=False,
                status_code=status.HTTP_401_UNAUTHORIZED,
                error_message=["Authentication credentials were not provided."],
            )

        return api_response(
            result={
                "latitude": request.user.latitude,
                "longitude": request.user.longitude,
            },
            is_success=True,
            status_code=status.HTTP_200_OK,
            error_message=[],
        )


# View for uploading profile photo
class UploadProfilePhotoView(ApiResponseAPIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    @extend_schema(tags=["Users"])
    def post(self, request):
        photo = request.FILES.get("photo")
        if not photo:
            return api_response(
                result=None,
                is_success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
                error_message=["No photo file provided."],
            )

        request.user.profile_photo = photo
        request.user.save(update_fields=["profile_photo"])

        serializer = UserProfileSerializer(request.user, context={"request": request})
        return api_response(
            result=serializer.data,
            is_success=True,
            status_code=status.HTTP_200_OK,
            error_message=[],
        )