from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers

from .models import DoctorProfile


User = get_user_model()

# Serializers for DoctorProfile
class DoctorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorProfile
        fields = "__all__"
        read_only_fields = ("id", "user", "created_at")

# Serializer for creating a doctor profile along with the user account
class CreateDoctorSerializer(serializers.Serializer):
    email = serializers.EmailField()
    full_name = serializers.CharField(max_length=255)
    password = serializers.CharField(write_only=True, min_length=8, trim_whitespace=False)
    specialization = serializers.CharField(max_length=100)
    hospital_name = serializers.CharField(max_length=255)
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)
    available_from = serializers.TimeField()
    available_to = serializers.TimeField()
    phone_number = serializers.CharField(max_length=20)

    def validate_email(self, value):
        normalized_email = value.lower()
        if User.objects.filter(email__iexact=normalized_email).exists():
            raise serializers.ValidationError("This email is already registered.")
        return normalized_email

    @transaction.atomic
    def create(self, validated_data):
        email = validated_data.pop("email")
        full_name = validated_data.pop("full_name")
        password = validated_data.pop("password")

        user = User.objects.create_user(
            email=email,
            full_name=full_name,
            password=password,
            role=User.Roles.DOCTOR,
        )
        return DoctorProfile.objects.create(user=user, **validated_data)
