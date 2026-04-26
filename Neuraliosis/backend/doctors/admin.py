from django.contrib import admin
from .models import DoctorProfile

# Register your models here.
@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ("full_name", "specialization", "hospital_name", "phone_number")
    search_fields = ("specialization", "hospital_name")

    @admin.display(description="Full name")
    def full_name(self, obj):
        return obj.user.full_name