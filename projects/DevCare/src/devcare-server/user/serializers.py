from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import UserProfile


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    role = serializers.CharField(write_only=True, required=False, default=UserProfile.ROLE_PATIENT)

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'password_confirm',
            'role',
            'first_name',
            'last_name',
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError(
                {'password_confirm': 'Passwords do not match.'}
            )

        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({'email': 'Email is already in use.'})

        return attrs

    def validate_role(self, value):
        normalized = str(value).lower().strip()
        allowed_roles = {choice[0] for choice in UserProfile.ROLE_CHOICES}
        if normalized not in allowed_roles:
            raise serializers.ValidationError('Role must be patient or doctor.')
        return normalized

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        role = validated_data.pop('role')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        UserProfile.objects.create(user=user, role=role)
        return user


class RoleTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        profile, _ = UserProfile.objects.get_or_create(
            user=self.user,
            defaults={'role': UserProfile.ROLE_PATIENT},
        )

        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'role': profile.role,
        }
        return data