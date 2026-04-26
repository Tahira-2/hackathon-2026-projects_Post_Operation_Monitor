from rest_framework import serializers

from .models import Appointment, AppointmentSlot, AppointmentReport


class AppointmentSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentSlot
        fields = "__all__"
        read_only_fields = ("id", "doctor", "is_booked", "created_at")


class CreateSlotSerializer(serializers.Serializer):
    date = serializers.DateField()
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()

    def validate(self, attrs):
        if attrs["start_time"] >= attrs["end_time"]:
            raise serializers.ValidationError("start_time must be before end_time.")
        return attrs


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = "__all__"
        read_only_fields = ("id", "created_at", "user")


class BookAppointmentSerializer(serializers.ModelSerializer):
    slot = serializers.PrimaryKeyRelatedField(
        queryset=AppointmentSlot.objects.filter(is_booked=False),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Appointment
        fields = ("doctor", "scheduled_time", "reason", "slot")


class UpdateAppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ("scheduled_time", "reason", "status")


class UpdateAppointmentStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=[
            Appointment.Status.CONFIRMED,
            Appointment.Status.CANCELLED,
            Appointment.Status.COMPLETED,
        ],
    )


class AppointmentReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentReport
        fields = "__all__"
        read_only_fields = ("id", "appointment", "created_at")


class CreateReportSerializer(serializers.Serializer):
    diagnosis = serializers.CharField()
    notes = serializers.CharField(required=False, default="", allow_blank=True)
    suggestions = serializers.CharField(required=False, default="", allow_blank=True)
    prescriptions = serializers.CharField(required=False, default="", allow_blank=True)