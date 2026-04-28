from django.contrib import admin

from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
	list_display = ('user', 'role', 'bio')
	list_filter = ('role',)
	search_fields = ('user__username', 'user__email')

# Register your models here.
