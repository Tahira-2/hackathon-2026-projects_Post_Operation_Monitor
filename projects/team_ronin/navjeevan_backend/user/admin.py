from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.contrib.auth.forms import UserCreationForm
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django import forms
import logging
from .models import NormalUser, MedicalPersonnel, generate_login_id

logger = logging.getLogger(__name__)


class MedicalPersonnelCreationForm(forms.ModelForm):
    """Custom form for creating medical personnel with proper validation."""
    
    class Meta:
        model = MedicalPersonnel
        fields = ('name', 'email', 'phone_number')
        widgets = {
            'name': forms.TextInput(attrs={'class': 'vTextField', 'style': 'width: 100%;'}),
            'email': forms.EmailInput(attrs={'class': 'vTextField', 'style': 'width: 100%;'}),
            'phone_number': forms.TextInput(attrs={'class': 'vTextField', 'style': 'width: 100%;'}),
        }
    
    def clean(self):
        """Validate the form data before saving."""
        cleaned_data = super().clean()
        name = cleaned_data.get('name', '').strip()
        email = cleaned_data.get('email', '').strip()
        phone_number = cleaned_data.get('phone_number', '').strip()
        
        errors = {}
        
        # Validate name
        if not name:
            errors['name'] = "Name is required."
        elif len(name) < 2:
            errors['name'] = "Name must be at least 2 characters long."
        
        # Validate email
        if not email:
            errors['email'] = "Email is required."
        elif MedicalPersonnel.objects.filter(email=email).exists():
            errors['email'] = f"A medical personnel with email '{email}' already exists."
        elif NormalUser.objects.filter(email=email).exists():
            # Warn but allow
            self.add_error(None, f"⚠️ Warning: A normal user with email '{email}' already exists. Different user types can have same email.")
        
        # Validate phone number
        if not phone_number:
            errors['phone_number'] = "Phone number is required."
        
        if errors:
            raise ValidationError(errors)
        
        return cleaned_data


class NormalUserCreationForm(forms.ModelForm):
    """Custom form for creating normal users with proper validation."""
    
    class Meta:
        model = NormalUser
        fields = ('name', 'email', 'phone_number', 'date_of_birth', 'special_conditions', 'region')
    
    def clean(self):
        """Validate the form data before saving."""
        cleaned_data = super().clean()
        name = cleaned_data.get('name', '').strip()
        email = cleaned_data.get('email', '').strip()
        
        errors = {}
        
        # Validate name
        if not name:
            errors['name'] = "Name is required."
        elif len(name) < 2:
            errors['name'] = "Name must be at least 2 characters long."
        
        # Validate email
        if not email:
            errors['email'] = "Email is required."
        elif NormalUser.objects.filter(email=email).exists():
            # Warn but allow
            self.add_error(None, f"⚠️ Warning: A normal user with email '{email}' already exists. Duplicates are allowed.")
        
        if errors:
            raise ValidationError(errors)
        
        return cleaned_data


class BaseUserAdmin(DjangoUserAdmin):
    """
    Custom admin for users that doesn't require password during creation.
    Password will be set during the activation step (2-step flow).
    """
    
    # Fieldsets for viewing/editing existing users
    fieldsets = (
        ('Basic Info', {
            'fields': ('login_id', 'name', 'email', 'phone_number')
        }),
        ('Status', {
            'fields': ('is_verified', 'status')
        }),
        ('Timestamps', {
            'fields': ('last_login_at', 'date_joined'),
            'classes': ('collapse',)
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('collapse',)
        }),
    )
    
    # Fieldsets for CREATING new users (no login_id, status needed yet)
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('name', 'email', 'phone_number'),
            'description': '<div style="background-color: #ffffcc; padding: 10px; border-radius: 5px; margin-bottom: 10px;">'
                          '<strong>ℹ️ Info:</strong> Account is created as inactive and unverified. '
                          'User sets password during activation. Login ID is auto-generated.'
                          '</div>'
        }),
    )
    
    list_display = ('login_id', 'name', 'email', 'phone_number', 'is_verified', 'status', 'user_type')
    list_filter = ('is_verified', 'status', 'user_type', 'date_joined')
    search_fields = ('login_id', 'name', 'email', 'phone_number')
    readonly_fields = ('login_id', 'uuid', 'user_type', 'last_login_at', 'date_joined')
    
    ordering = ('-date_joined',)


@admin.register(NormalUser)
class NormalUserAdmin(BaseUserAdmin):
    """Admin for Normal Users."""
    
    add_form = NormalUserCreationForm
    form = NormalUserCreationForm
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Normal User Info', {
            'fields': ('date_of_birth', 'special_conditions', 'region')
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('name', 'email', 'phone_number', 'date_of_birth', 
                      'special_conditions', 'region'),
            'description': '<div style="background-color: #ffffcc; padding: 10px; border-radius: 5px; margin-bottom: 10px;">'
                          '<strong>ℹ️ Password:</strong> Leave blank. The user will set their password during account activation. '
                          'A login_id will be auto-generated and emailed to them.'
                          '</div>'
        }),
    )
    
    def get_fieldsets(self, request, obj=None):
        if obj is None:  # Adding
            return self.add_fieldsets
        return self.fieldsets
    
    list_display = ('login_id', 'name', 'email', 'is_verified', 'status', 'date_of_birth', 'region')
    
    def save_model(self, request, obj, form, change):
        """Auto-generate login_id and set defaults for new normal users."""
        if not change:  # Creating new user
            # Auto-generate login_id
            if not obj.login_id:
                obj.login_id = generate_login_id(obj.name, obj.uuid)
            
            obj.is_verified = False
            obj.status = 'inactive'
            obj.set_unusable_password()
        
        try:
            super().save_model(request, obj, form, change)
            if not change:
                messages.success(
                    request,
                    f"✅ Normal user '{obj.name}' created successfully as inactive. "
                    f"Login ID: {obj.login_id}. User can activate via the activation portal."
                )
        except IntegrityError as e:
            error_msg = str(e).lower()
            if 'email' in error_msg:
                messages.error(request, f"❌ Email '{obj.email}' is already in use.")
            else:
                messages.error(request, "❌ A database error occurred. Please try again.")
            logger.error(f"Integrity error creating normal user: {e}")
        except Exception as e:
            messages.error(request, f"❌ Unexpected error: {str(e)}")
            logger.error(f"Unexpected error creating normal user: {e}", exc_info=True)


@admin.register(MedicalPersonnel)
class MedicalPersonnelAdmin(BaseUserAdmin):
    """Admin for Medical Personnel. Superadmin-only creation."""
    
    add_form = MedicalPersonnelCreationForm
    form = MedicalPersonnelCreationForm
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('name', 'email', 'phone_number'),
            'description': '<div style="background-color: #ffffcc; padding: 10px; border-radius: 5px; margin-bottom: 10px;">'
                          '<strong>ℹ️ Registration Flow:</strong><br>'
                          '1. Create the account here (no password needed)<br>'
                          '2. A login_id will be auto-generated and emailed to them<br>'
                          '3. They will set their password during account activation<br><br>'
                          '</div>'
        }),
    )
    
    def get_fieldsets(self, request, obj=None):
        if obj is None:  # Adding
            return self.add_fieldsets
        return self.fieldsets
    
    def save_model(self, request, obj, form, change):
        """Auto-generate login_id, set defaults, and handle errors gracefully."""
        if not change:  # Creating new medical personnel
            # Auto-generate login_id
            if not obj.login_id:
                obj.login_id = generate_login_id(obj.name, obj.uuid)
            
            # Set required fields for medical personnel
            obj.user_type = 'medical'
            obj.is_verified = False
            obj.status = 'inactive'
            obj.set_unusable_password()
        
        try:
            super().save_model(request, obj, form, change)
            if not change:
                messages.success(
                    request,
                    f"✅ Medical Personnel '{obj.name}' created successfully! "
                    f"Login ID: {obj.login_id} | Status: Inactive | Email: {obj.email}"
                )
        except IntegrityError as e:
            error_msg = str(e).lower()
            if 'email' in error_msg:
                messages.error(request, f"❌ Email '{obj.email}' is already in use.")
            elif 'phone' in error_msg:
                messages.error(request, f"❌ Phone number '{obj.phone_number}' is already in use.")
            else:
                messages.error(request, "❌ A database error occurred. Please check your input and try again.")
            logger.error(f"Integrity error creating medical personnel: {e}")
        except Exception as e:
            messages.error(request, f"❌ Unexpected error: {str(e)}")
            logger.error(f"Unexpected error creating medical personnel: {e}", exc_info=True)
    
    def has_add_permission(self, request):
        """Only superusers can add medical personnel."""
        return request.user.is_superuser
    
    def has_delete_permission(self, request, obj=None):
        """Only superusers can delete medical personnel."""
        return request.user.is_superuser
    
    def has_change_permission(self, request, obj=None):
        """Only superusers can modify medical personnel."""
        return request.user.is_superuser