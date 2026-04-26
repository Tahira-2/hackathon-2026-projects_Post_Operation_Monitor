from django.contrib import admin
from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
	list_display = ("user", "doctor", "scheduled_time", "status", "created_at")
	list_filter = ("status",)
	search_fields = ("user__email", "doctor__specialization")
