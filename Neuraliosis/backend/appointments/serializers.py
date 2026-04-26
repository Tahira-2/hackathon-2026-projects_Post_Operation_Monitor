from rest_framework import serializers

from .models import Appointment

# Serializers for Appointment model
class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = "__all__"
        read_only_fields = ("id", "created_at", "user")

# Separate serializers for different operations to ensure proper validation and control over fields
class BookAppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ("doctor", "scheduled_time", "reason")


class UpdateAppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ("scheduled_time", "reason", "status")


class UpdateAppointmentStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=[Appointment.Status.CONFIRMED, Appointment.Status.CANCELLED],
    )