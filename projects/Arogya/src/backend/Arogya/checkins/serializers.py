from rest_framework import serializers
from .models import DailyCheckIn


class DailyCheckInSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyCheckIn
        fields = '__all__'
        read_only_fields = ['user', 'risk_level', 'guidance', 'created_at']