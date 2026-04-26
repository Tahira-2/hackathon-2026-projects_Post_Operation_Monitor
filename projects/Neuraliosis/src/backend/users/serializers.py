from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers

User = get_user_model()

# Serializer for user registration
class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        error_messages={
            "required": "Email is required.",
            "blank": "Email is required.",
            "invalid": "Please enter a valid email address.",
        }
    )
    full_name = serializers.CharField(
        error_messages={
            "required": "Full name is required.",
            "blank": "Full name is required.",
        }
    )
    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
        error_messages={
            "required": "Password is required.",
            "blank": "Password is required.",
        },
    )
    role = serializers.CharField(
        error_messages={
            "required": "Role is required.",
            "blank": "Role is required.",
        }
    )

    class Meta:
        model = User
        fields = ("email", "full_name", "password", "role")

    def validate_email(self, value):
        normalized_email = value.lower()
        if User.objects.filter(email__iexact=normalized_email).exists():
            raise serializers.ValidationError("This email is already registered.")
        return normalized_email

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters.")
        return value

    def validate_role(self, value):
        normalized_role = value.strip().lower()
        valid_roles = {role for role, _ in User.Roles.choices}
        if normalized_role not in valid_roles:
            raise serializers.ValidationError("Role must be one of: user, doctor, admin.")
        if normalized_role == User.Roles.ADMIN:
            raise serializers.ValidationError("Admin role cannot be assigned during registration.")
        return normalized_role

    def create(self, validated_data):
        password = validated_data.pop("password")
        return User.objects.create_user(password=password, **validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(
        error_messages={
            "required": "Email is required.",
            "blank": "Email is required.",
            "invalid": "Please enter a valid email address.",
        }
    )
    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
        error_messages={
            "required": "Password is required.",
            "blank": "Password is required.",
        },
    )

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")
        request = self.context.get("request")

        user = authenticate(request=request, username=email, password=password)
        if user is None:
            raise serializers.ValidationError("Invalid email or password.")

        if not user.is_active:
            raise serializers.ValidationError("User account is disabled.")

        attrs["user"] = user
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        exclude = ("password",)
        read_only_fields = (
            "id",
            "role",
            "created_at",
            "last_login",
            "is_staff",
            "is_superuser",
            "is_active",
            "groups",
            "user_permissions",
            "profile_photo",
        )

    def get_photo_url(self, obj):
        if obj.profile_photo:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.profile_photo.url)
            return obj.profile_photo.url
        return None