from django.contrib import admin
from .models import Medicine


@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "price", "stock", "requires_prescription")
    list_filter = ("category", "requires_prescription")
    search_fields = ("name",)
