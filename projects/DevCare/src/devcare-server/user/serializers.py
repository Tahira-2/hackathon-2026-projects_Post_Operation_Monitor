from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    email = serializers.EmailField(source='user.email')
    avatar_url = serializers.SerializerMethodField()
    joined_at = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            'id',
            'username',
            'email',
            'role',
            'joined_at',
            'bio',
            'avatar',
            'avatar_url',
        ]
        read_only_fields = ['id', 'role', 'joined_at', 'avatar_url']

    def get_avatar_url(self, obj):
        if not obj.avatar:
            return None

        request = self.context.get('request')
        if request is not None:
            return request.build_absolute_uri(obj.avatar.url)
        return obj.avatar.url

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user

        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


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
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # If the frontend sends 'email' instead of 'username', map it.
        self.fields['email'] = serializers.EmailField(write_only=True, required=False)
        self.fields['username'].required = False

    def validate(self, attrs):
        # If 'email' is provided but 'username' is not, use 'email' as the username.
        if 'email' in attrs and not attrs.get('username'):
            attrs['username'] = attrs['email']
        
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
