from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "phone", "role"]
        read_only_fields = ["id"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["username", "email", "password", "first_name", "role"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            role=validated_data.get("role", "patient"),
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        username = data.get("username", "").strip()
        password = data.get("password", "")

        if not username:
            raise serializers.ValidationError({"detail": "Username is required."})

        if not password:
            raise serializers.ValidationError({"detail": "Password is required."})

        user = authenticate(username=username, password=password)

        if user is None:
            # Try authenticating with email as username
            try:
                user_obj = User.objects.get(email=username)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                user = None

        if user is None:
            raise serializers.ValidationError(
                {"detail": "Invalid username or password. Please try again."}
            )

        if not user.is_active:
            raise serializers.ValidationError(
                {"detail": "This account has been disabled. Please contact support."}
            )

        data["user"] = user
        return data
