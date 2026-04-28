from django.contrib import admin
from .models import Appointment, AppointmentSlot, AppointmentReport


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("user", "doctor", "scheduled_time", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("user__email", "doctor__specialization")


@admin.register(AppointmentSlot)
class AppointmentSlotAdmin(admin.ModelAdmin):
    list_display = ("doctor", "date", "start_time", "end_time", "is_booked")
    list_filter = ("is_booked", "date")


@admin.register(AppointmentReport)
class AppointmentReportAdmin(admin.ModelAdmin):
    list_display = ("appointment", "diagnosis", "created_at")
    search_fields = ("diagnosis",)
