from django.db import models
from django.conf import settings

# Create your models here.

class DailyCheckIn(models.Model):
    RISK_CHOICES = [
        ('normal', 'Normal'),
        ('warning', 'Warning'),
        ('emergency', 'Emergency'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='checkins')
    symptoms = models.TextField()
    pain_level = models.IntegerField(default=0)
    fever = models.BooleanField(default=False)
    breathing_problem = models.BooleanField(default=False)
    bleeding = models.BooleanField(default=False)
    risk_level = models.CharField(max_length=20, choices=RISK_CHOICES, default='normal')
    guidance = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def classify_risk(self):
        if self.breathing_problem or self.bleeding or self.pain_level >= 8:
            return 'emergency'
        elif self.fever or self.pain_level >= 5:
            return 'warning'
        return 'normal'

    def save(self, *args, **kwargs):
        self.risk_level = self.classify_risk()

        if self.risk_level == 'emergency':
            self.guidance = "Emergency warning. Please contact a doctor or emergency service immediately."
        elif self.risk_level == 'warning':
            self.guidance = "Warning signs detected. Please monitor your condition and contact a doctor if it worsens."
        else:
            self.guidance = "Your condition looks normal based on your input. Continue following discharge instructions."

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.risk_level}"