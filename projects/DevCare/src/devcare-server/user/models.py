from django.contrib.auth.models import User
from django.db import models


class UserProfile(models.Model):
	ROLE_PATIENT = 'patient'
	ROLE_DOCTOR = 'doctor'
	ROLE_CHOICES = [
		(ROLE_PATIENT, 'Patient'),
		(ROLE_DOCTOR, 'Doctor'),
	]

	user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
	role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_PATIENT)
	created_at = models.DateTimeField(auto_now_add=True)
	avatar = models.ImageField(upload_to='profile_avatars/', blank=True, null=True)
	bio = models.CharField(max_length=160, blank=True, default='')

	def __str__(self):
		return f'{self.user.username} ({self.role})'
