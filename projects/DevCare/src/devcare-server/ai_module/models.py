from django.conf import settings
from django.db import models


class ExerciseSession(models.Model):
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ai_exercise_sessions",
    )
    exercise = models.CharField(max_length=64)
    reps = models.PositiveIntegerField(default=0)
    avg_range = models.FloatField(default=0.0)
    form_accuracy = models.FloatField(default=0.0)
    duration = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.patient} - {self.exercise} ({self.created_at:%Y-%m-%d %H:%M})"
