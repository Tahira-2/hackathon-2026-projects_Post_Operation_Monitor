from rest_framework import serializers

from .models import Vaccination, Event, EventVaccination, EventUser


class VaccinationSerializer(serializers.ModelSerializer):
	class Meta:
		model = Vaccination
		fields = ['id', 'vaccination_name', 'vaccination_dosage', 'status']
		read_only_fields = ['id']


class EventSerializer(serializers.ModelSerializer):
	"""Serializer for Event model with nested organized_by info."""
	organized_by_name = serializers.CharField(source='organized_by.name', read_only=True)
	event_location_name = serializers.CharField(source='event_location.name', read_only=True)
	vaccination_ids = serializers.PrimaryKeyRelatedField(
		queryset=Vaccination.objects.all(),
		many=True,
		write_only=True,
		required=True,
		help_text='Select one or more existing vaccines for this event.'
	)
	vaccinations = serializers.SerializerMethodField(read_only=True)

	class Meta:
		model = Event
		fields = [
			'id', 'name', 'organized_by', 'organized_by_name', 'event_status',
			'description', 'created_at', 'updated_at', 'event_location',
			'event_location_name', 'contact_phone_number',
			'vaccination_ids', 'vaccinations'
		]
		read_only_fields = ['id', 'created_at', 'updated_at', 'organized_by', 'contact_phone_number']

	def get_vaccinations(self, obj):
		links = EventVaccination.objects.filter(event=obj).select_related('vaccination')
		return [
			{
				'id': link.vaccination.id,
				'vaccination_name': link.vaccination.vaccination_name,
				'status': link.vaccination.status,
			}
			for link in links
		]

	def validate_contact_phone_number(self, value):
		"""Validate phone number format."""
		if not value or len(value) < 9:
			raise serializers.ValidationError("Phone number must be at least 9 digits.")
		if not any(c.isdigit() for c in value):
			raise serializers.ValidationError("Phone number must contain at least one digit.")
		return value

	def validate_name(self, value):
		"""Validate event name."""
		if not value or len(value) < 2:
			raise serializers.ValidationError("Event name must be at least 2 characters.")
		return value

	def validate_vaccination_ids(self, value):
		if not value:
			raise serializers.ValidationError("Select at least one vaccine for the event.")
		return value

	def create(self, validated_data):
		"""Create event with organizer, auto contact number, and linked vaccines."""
		vaccines = validated_data.pop('vaccination_ids', [])
		user = self.context['request'].user

		validated_data['organized_by'] = user
		validated_data['contact_phone_number'] = user.phone_number

		event = Event.objects.create(**validated_data)
		EventVaccination.objects.bulk_create(
			[EventVaccination(event=event, vaccination=vaccine) for vaccine in vaccines]
		)
		return event

	def update(self, instance, validated_data):
		"""Update event and optionally sync linked vaccines."""
		vaccines = validated_data.pop('vaccination_ids', None)
		user = self.context['request'].user

		for attr, value in validated_data.items():
			setattr(instance, attr, value)

		# Keep event contact aligned with the organizer's current phone number.
		instance.contact_phone_number = user.phone_number
		instance.save()

		if vaccines is not None:
			EventVaccination.objects.filter(event=instance).delete()
			EventVaccination.objects.bulk_create(
				[EventVaccination(event=instance, vaccination=vaccine) for vaccine in vaccines]
			)

		return instance


class EventVaccinationSerializer(serializers.ModelSerializer):
	"""Serializer for EventVaccination junction table."""
	event_name = serializers.CharField(source='event.name', read_only=True)
	vaccination_name = serializers.CharField(source='vaccination.vaccination_name', read_only=True)

	class Meta:
		model = EventVaccination
		fields = ['id', 'event', 'event_name', 'vaccination', 'vaccination_name']
		read_only_fields = ['id']


class EventUserSerializer(serializers.ModelSerializer):
	"""Serializer for EventUser junction table."""
	event_name = serializers.CharField(source='event.name', read_only=True)
	user_name = serializers.CharField(source='user.name', read_only=True)

	class Meta:
		model = EventUser
		fields = ['id', 'event', 'event_name', 'user', 'user_name']
		read_only_fields = ['id']
