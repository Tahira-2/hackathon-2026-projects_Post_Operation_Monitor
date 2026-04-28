from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import RegexValidator
from django.utils import timezone
import uuid


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def generate_login_id(name: str, user_uuid: uuid.UUID) -> str:
    """
    Build a deterministic, always-unique login ID:
        first 4 alphanumeric chars of name (uppercased)
        + '-'
        + first 4 chars of the user UUID hex (uppercased)

    Example:  name="John Doe", uuid="a1b2c3d4-..."  →  "JOHN-A1B2"

    Because every UUID is unique, two users with the same name
    will always get different login IDs with no collision loop needed.
    """
    name_part = ''.join(c for c in name.upper() if c.isalnum())[:4].ljust(2, 'X')
    uuid_part = str(user_uuid).replace('-', '').upper()[:4]
    return f"{name_part}-{uuid_part}"          # always exactly 9 chars


# ---------------------------------------------------------------------------
# Manager
# ---------------------------------------------------------------------------

class CustomUserManager(BaseUserManager):
    """Shared manager for NormalUser and MedicalPersonnel."""

    def create_user(self, email: str, login_id: str, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required.")
        if not login_id:
            raise ValueError("Login ID is required.")
        email = self.normalize_email(email)
        user  = self.model(email=email, login_id=login_id, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email: str, login_id: str, password: str, **extra_fields):
        extra_fields.setdefault("is_staff",     True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("user_type",    "medical")
        extra_fields.setdefault("is_verified",  True)
        extra_fields.setdefault("status",       "active")

        if not extra_fields.get("is_staff"):
            raise ValueError("Superuser must have is_staff=True.")
        if not extra_fields.get("is_superuser"):
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, login_id, password, **extra_fields)


# ---------------------------------------------------------------------------
# Abstract base
# ---------------------------------------------------------------------------

class BaseUser(AbstractUser):
    """
    Shared base for NormalUser and MedicalPersonnel.

    Django's AbstractUser already provides:
        is_staff, is_active, is_superuser, date_joined,
        last_login, groups, user_permissions.

    We replace `username` with `login_id`.

    ── 2-step NormalUser registration flow ──────────────────────────────────
    Step 1  POST /user/register/
            Body: name, email, phone_number, date_of_birth,
                  special_conditions, region
            → account created (is_verified=False, no password set)
            → login_id emailed to the user

    Step 2  POST /user/activate/
            Body: login_id, password, confirm_password
            → password validated & set, is_verified=True
            → JWT tokens returned → frontend redirects to app
    ─────────────────────────────────────────────────────────────────────────
    """

    USER_TYPE_CHOICES = (
        ('normal',  'Normal User'),
        ('medical', 'Medical Personnel'),
    )
    STATUS_CHOICES = (
        ('active',   'Active'),
        ('inactive', 'Inactive'),
    )

    # Remove Django's default username — login_id takes its place
    username = None  # type: ignore[assignment]

    uuid          = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    login_id      = models.CharField(
                        max_length=20, unique=True,
                        help_text="Auto-generated: NAME-UUID (e.g. JOHN-A1B2)")
    name          = models.CharField(max_length=255)
    email         = models.EmailField()
    phone_number  = models.CharField(
                        max_length=20,
                        validators=[RegexValidator(
                            regex=r'^\+?1?\d{9,15}$',
                            message="Phone number must be 9–15 digits, optionally prefixed with +.",
                        )])
    status        = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    is_verified   = models.BooleanField(
                        default=False,
                        help_text="False until the user completes Step 2 activation.")
    user_type     = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='normal')
    last_login_at = models.DateTimeField(null=True, blank=True)

    # Suppress reverse-accessor clashes (Django E304) that arise when two
    # concrete models both inherit groups/user_permissions from the same
    # abstract base. related_name='+' disables the reverse relation entirely.
    groups = models.ManyToManyField(
        'auth.Group',
        blank=True,
        related_name='+',
        verbose_name='groups',
        help_text='The groups this user belongs to.',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        blank=True,
        related_name='+',
        verbose_name='user permissions',
        help_text='Specific permissions for this user.',
    )

    objects = CustomUserManager()  # type: ignore[assignment]

    USERNAME_FIELD  = 'login_id'
    EMAIL_FIELD     = 'email'
    REQUIRED_FIELDS = ['email', 'name']

    class Meta:
        abstract = True

    def __str__(self):
        return f"{self.name} ({self.login_id})"

    def update_last_login(self):
        self.last_login_at = timezone.now()
        self.save(update_fields=['last_login_at'])


# ---------------------------------------------------------------------------
# Concrete models
# ---------------------------------------------------------------------------

class NormalUser(BaseUser):
    """Users who self-register via the 2-step flow."""

    date_of_birth      = models.DateField(null=True, blank=True)
    special_conditions = models.TextField(
                            blank=True,
                            help_text="Comma-separated list of special health conditions")
    region             = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table            = 'normal_user'
        verbose_name        = 'Normal User'
        verbose_name_plural = 'Normal Users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['login_id']),
            models.Index(fields=['status']),
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Ensure user_type is always 'normal' for NormalUser instances
        self.user_type = 'normal'

    def save(self, *args, **kwargs):
        self.user_type = 'normal'
        super().save(*args, **kwargs)

    @property
    def age(self):
        if not self.date_of_birth:
            return None
        today = timezone.now().date()
        dob   = self.date_of_birth
        return today.year - dob.year - (
            (today.month, today.day) < (dob.month, dob.day)
        )


class MedicalPersonnel(BaseUser):
    """Medical staff created directly by a superadmin."""

    class Meta:
        db_table            = 'medical_personnel'
        verbose_name        = 'Medical Personnel'
        verbose_name_plural = 'Medical Personnel'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['login_id']),
            models.Index(fields=['status']),
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Ensure user_type is always 'medical' for MedicalPersonnel instances
        self.user_type = 'medical'

    def save(self, *args, **kwargs):
        self.user_type = 'medical'
        super().save(*args, **kwargs)