from django.contrib import admin

from .models import ExerciseSession


@admin.register(ExerciseSession)
class ExerciseSessionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "patient",
        "exercise",
        "reps",
        "avg_range",
        "form_accuracy",
        "duration",
        "created_at",
    )
    search_fields = ("patient__username", "exercise")
    list_filter = ("exercise", "created_at")
