from django.db import models
import uuid
from django.utils.translation import gettext_lazy as _

from user.models import *
from visualisation.models import *

class Vaccination(models.Model):
    class VaccinationStatus(models.TextChoices):
        AVAILABLE = 'AVAILABLE', _('AVAILABLE')
        UNAVAILABLE = 'UNAVAILABLE', _('UNAVAILABLE')

    vaccination_name = models.CharField(max_length=100)
    vaccination_dosage = models.IntegerField(default=1)
    status = models.CharField(
        choices=VaccinationStatus.choices,
        default=VaccinationStatus.AVAILABLE,
        max_length=20
    )

    def __str__(self):
        return self.vaccination_name

class Event (models.Model):
    class EventStatus(models.TextChoices):
        NOT_STARTED = 'NOT_STARTED', _('NOT_STARTED')
        IN_PROGRESS = 'IN_PROGRESS', _('IN_PROGRESS')
        ENDED = 'ENDED', _('ENDED')
    
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
        )
    
    name = models.CharField(
        max_length=40,
        verbose_name=_('Name of the Event')
    )

    organized_by = models.ForeignKey(
        MedicalPersonnel,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name=_('Organized By')
    )

    event_status = models.CharField(
        choices=EventStatus.choices,
        default=EventStatus.NOT_STARTED,
        verbose_name=_('Event Status'),
        max_length=20
    )

    description = models.TextField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name=_('Event Description')
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    event_location = models.ForeignKey(
        District, 
        on_delete=models.SET_NULL,
        null=True,
        verbose_name=_('Event Location')
    )

    contact_phone_number = models.CharField(
        max_length=100,
        verbose_name=_('Contact Phone Number')
    )
    class Meta:
        verbose_name = _('Event')
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
class EventVaccination(models.Model):
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        verbose_name=_('Event')
    )

    vaccination = models.ForeignKey(
        Vaccination,
        on_delete=models.CASCADE,
        verbose_name=_('Vaccination')
    )
    class Meta:
        verbose_name = _('Event Vaccination')
        ordering = ['-event__created_at']
    
    def __str__(self):
        return f"{self.event.name} - {self.vaccination.vaccination_name}"

class EventUser(models.Model):
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        verbose_name=_('Event')
    )

    user = models.ForeignKey(
        NormalUser,
        on_delete=models.CASCADE,
        verbose_name=_('User')
    )

    class Meta:
        verbose_name = _('Event User')
        ordering = ['-event__created_at']
    
    def __str__(self):
        return f"{self.user.name} - {self.event.name}"


class UserNotification(models.Model):
    class NotificationType(models.TextChoices):
        PROGRAM = 'PROGRAM', _('PROGRAM')
        VACCINATION = 'VACCINATION', _('VACCINATION')
        PROFILE = 'PROFILE', _('PROFILE')
        ACCOUNT = 'ACCOUNT', _('ACCOUNT')

    user = models.ForeignKey(
        NormalUser,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name=_('User'),
    )
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications',
        verbose_name=_('Event'),
    )
    notification_type = models.CharField(
        choices=NotificationType.choices,
        default=NotificationType.PROGRAM,
        max_length=30,
    )
    title = models.CharField(max_length=120)
    message = models.TextField(max_length=500)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('User Notification')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.login_id} - {self.title}"