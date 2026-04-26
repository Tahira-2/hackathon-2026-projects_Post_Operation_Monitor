from django.conf import settings
from django.db import models

from doctors.models import DoctorProfile


class Appointment(models.Model):
	class Status(models.TextChoices):
		PENDING = "pending", "Pending"
		CONFIRMED = "confirmed", "Confirmed"
		CANCELLED = "cancelled", "Cancelled"

	user = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name="appointments",
	)
	doctor = models.ForeignKey(
		DoctorProfile,
		on_delete=models.CASCADE,
		related_name="appointments",
	)
	scheduled_time = models.DateTimeField()
	status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
	reason = models.TextField()
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.user.email} -> {self.doctor.specialization} @ {self.scheduled_time}"
