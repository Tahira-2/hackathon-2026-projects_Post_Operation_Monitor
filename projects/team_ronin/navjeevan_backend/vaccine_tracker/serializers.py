from rest_framework import serializers
from .models import Vaccine
from visualisation.models import IndividualVaccinationRecord, District

class VaccineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vaccine
        fields = ['id', 'name', 'recommended_timeframe', 'deadline_days']

class IndividualVaccinationRecordSerializer(serializers.ModelSerializer):
    # Allow district to be passed as a string (name) or ID
    district = serializers.SlugRelatedField(
        slug_field='name',
        queryset=District.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = IndividualVaccinationRecord
        fields = ['id', 'user', 'vaccine_name', 'dose_number', 'date_administered', 'scheduled_date', 'status', 'district', 'administered_by', 'notes']
        read_only_fields = ['user']

    def validate(self, attrs):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        vaccine_name = attrs.get('vaccine_name') or getattr(self.instance, 'vaccine_name', None)
        dose_number = attrs.get('dose_number') or getattr(self.instance, 'dose_number', None)

        if user and vaccine_name and dose_number:
            duplicate_qs = IndividualVaccinationRecord.objects.filter(
                user=user,
                vaccine_name=vaccine_name,
                dose_number=dose_number,
            )
            if self.instance:
                duplicate_qs = duplicate_qs.exclude(pk=self.instance.pk)

            if duplicate_qs.exists():
                raise serializers.ValidationError(
                    {
                        'non_field_errors': [
                            'This vaccine and dose already exists in your records. Edit the existing entry instead.'
                        ]
                    }
                )

        return attrs

    def to_internal_value(self, data):
        # If district is provided as a string that doesn't exist, 
        # we still want to allow the request to proceed (setting district to None)
        # instead of failing with a 400 error.
        if 'district' in data and data['district']:
            district_name = data['district']
            if not District.objects.filter(name__iexact=district_name).exists():
                # Option 1: Create the district (might be too aggressive)
                # Option 2: Just set it to None so the record still saves
                data_copy = data.copy()
                data_copy['district'] = None
                return super().to_internal_value(data_copy)
        
        return super().to_internal_value(data)

    def create(self, validated_data):
        return super().create(validated_data)
