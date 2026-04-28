from django.db import models

class Vaccine(models.Model):
    name = models.CharField(max_length=255)
    recommended_timeframe = models.CharField(max_length=255, help_text="e.g., 'At Birth', '6 Weeks'")
    deadline_days = models.IntegerField(help_text="Maximum days after birth this vaccine can be given", null=True, blank=True)
    
    def __str__(self):
        return self.name
