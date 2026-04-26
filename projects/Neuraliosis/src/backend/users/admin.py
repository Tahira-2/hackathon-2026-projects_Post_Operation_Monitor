from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserChangeForm, UserCreationForm

from .models import CustomUser


class CustomUserCreationForm(UserCreationForm):
	class Meta(UserCreationForm.Meta):
		model = CustomUser
		fields = (
			"email",
			"full_name",
			"role",
			"latitude",
			"longitude",
			"is_active",
			"is_staff",
		)


class CustomUserChangeForm(UserChangeForm):
	class Meta:
		model = CustomUser
		fields = "__all__"


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
	add_form = CustomUserCreationForm
	form = CustomUserChangeForm
	model = CustomUser

	list_display = ("email", "full_name", "role", "is_active", "is_staff", "created_at")
	list_filter = ("role", "is_active", "is_staff")
	search_fields = ("email", "full_name")
	ordering = ("created_at",)
	readonly_fields = ("created_at", "last_login")

	fieldsets = (
		(None, {"fields": ("email", "password")}),
		("Profile", {"fields": ("full_name", "role", "latitude", "longitude")}),
		(
			"Permissions",
			{
				"fields": (
					"is_active",
					"is_staff",
					"is_superuser",
					"groups",
					"user_permissions",
				)
			},
		),
		("Important dates", {"fields": ("last_login", "created_at")}),
	)

	add_fieldsets = (
		(
			None,
			{
				"classes": ("wide",),
				"fields": (
					"email",
					"full_name",
					"role",
					"latitude",
					"longitude",
					"password1",
					"password2",
					"is_active",
					"is_staff",
				),
			},
		),
	)
