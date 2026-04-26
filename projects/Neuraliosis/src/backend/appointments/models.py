from django.conf import settings
from django.db import models

from doctors.models import DoctorProfile


class AppointmentSlot(models.Model):
	doctor = models.ForeignKey(
		DoctorProfile,
		on_delete=models.CASCADE,
		related_name="slots",
	)
	date = models.DateField()
	start_time = models.TimeField()
	end_time = models.TimeField()
	is_booked = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ["date", "start_time"]

	def __str__(self):
		return f"{self.doctor} | {self.date} {self.start_time}-{self.end_time}"


class Appointment(models.Model):
	class Status(models.TextChoices):
		PENDING = "pending", "Pending"
		CONFIRMED = "confirmed", "Confirmed"
		CANCELLED = "cancelled", "Cancelled"
		COMPLETED = "completed", "Completed"

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
	slot = models.ForeignKey(
		AppointmentSlot,
		on_delete=models.SET_NULL,
		null=True,
		blank=True,
		related_name="appointment",
	)
	scheduled_time = models.DateTimeField()
	status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
	reason = models.TextField()
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.user.email} -> {self.doctor.specialization} @ {self.scheduled_time}"


class AppointmentReport(models.Model):
	appointment = models.OneToOneField(
		Appointment,
		on_delete=models.CASCADE,
		related_name="report",
	)
	diagnosis = models.TextField()
	notes = models.TextField(blank=True, default="")
	suggestions = models.TextField(blank=True, default="")
	prescriptions = models.TextField(blank=True, default="")
	report_file = models.FileField(upload_to='reports/', null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"Report for {self.appointment}"
