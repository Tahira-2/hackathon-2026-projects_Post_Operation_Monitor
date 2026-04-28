from django.contrib import admin

from .models import DischargeReport


@admin.register(DischargeReport)
class DischargeReportAdmin(admin.ModelAdmin):
    list_display = ("id", "patient", "file_type", "status", "uploaded_at")
    list_filter = ("file_type", "status", "uploaded_at")
    search_fields = ("patient__username", "patient__email")
