from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User
from .serializers import LoginSerializer, RegisterSerializer, UserSerializer


class RegisterView(APIView):
    """
    User registration endpoint
    Creates a new user and returns authentication token
    """

    permission_classes = []  # Allow anyone to register

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # Create or get token for the user
            token, created = Token.objects.get_or_create(user=user)

            return Response(
                {
                    "message": "Account created successfully",
                    "token": token.key,
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    User login endpoint
    Authenticates user and returns authentication token
    """

    permission_classes = []  # Allow anyone to login

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]

            # Create or get token for the user
            token, created = Token.objects.get_or_create(user=user)

            return Response(
                {
                    "message": "Login successful",
                    "token": token.key,
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    User logout endpoint
    Deletes the user's authentication token
    """

    def post(self, request):
        try:
            request.user.auth_token.delete()
            return Response(
                {"message": "Successfully logged out"}, status=status.HTTP_200_OK
            )
        except Exception:
            return Response(
                {"error": "Logout failed"}, status=status.HTTP_400_BAD_REQUEST
            )


class UserProfileView(APIView):
    """
    Get and update current user's profile
    """

    def get(self, request):
        if not request.user.is_authenticated:
            return Response(
                {"error": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        if not request.user.is_authenticated:
            return Response(
                {"error": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Profile updated successfully", "user": serializer.data},
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
