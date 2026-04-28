import logging
from django.db.models import Q
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet
from rest_framework.exceptions import PermissionDenied

from my_project.permissions import IsMedicalPersonnel, IsNormalUser
from user.models import MedicalPersonnel, NormalUser
from visualisation.models import IndividualVaccinationRecord

from .models import Vaccination, Event, EventUser, UserNotification
from .serializers import VaccinationSerializer, EventSerializer

logger = logging.getLogger(__name__)


class EventViewSet(GenericViewSet):
	"""
	Event management endpoints.
	- Medical personnel: create, update, list, retrieve events
	- Normal users: list, retrieve events (read-only)
	"""
	queryset = Event.objects.all().order_by('-created_at')
	serializer_class = EventSerializer
	permission_classes = [IsAuthenticated]

	def get_permissions(self):
		"""
		Override permissions based on action.
		- list, retrieve: Allow authenticated users (both medical and normal)
		- create, update, partial_update: Medical personnel only
		"""
		if self.action in ['create', 'update', 'partial_update', 'destroy']:
			self.permission_classes = [IsAuthenticated, IsMedicalPersonnel]
		elif self.action in ['list', 'retrieve']:
			self.permission_classes = [IsAuthenticated]
		return super().get_permissions()

	def list(self, request):
		"""List all events."""
		try:
			queryset = self.get_queryset()
			serializer = self.get_serializer(queryset, many=True)
			logger.info(f"User {request.user} listed {len(queryset)} events")
			return Response({
				'count': len(queryset),
				'results': serializer.data
			}, status=status.HTTP_200_OK)
		except Exception as e:
			logger.error(f"Error listing events: {str(e)}", exc_info=True)
			return Response({
				'error': 'Failed to retrieve events',
				'detail': 'An unexpected server error occurred.'
			}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

	def retrieve(self, request, pk=None):
		"""Retrieve a single event by ID."""
		try:
			instance = self.get_object()
			serializer = self.get_serializer(instance)
			logger.info(f"User {request.user} retrieved event {pk}")
			return Response(serializer.data, status=status.HTTP_200_OK)
		except Event.DoesNotExist:
			logger.warning(f"Event {pk} not found for user {request.user}")
			return Response({
				'error': 'Event not found',
				'detail': f'Event with ID {pk} does not exist.'
			}, status=status.HTTP_404_NOT_FOUND)
		except Exception as e:
			logger.error(f"Error retrieving event {pk}: {str(e)}", exc_info=True)
			return Response({
				'error': 'Failed to retrieve event',
				'detail': 'An unexpected server error occurred.'
			}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

	def create(self, request):
		"""Create a new event (medical personnel only)."""
		try:
			# Verify user is medical personnel
			if not isinstance(request.user, MedicalPersonnel):
				logger.warning(f"Non-medical user {request.user} attempted to create event")
				raise PermissionDenied(
					detail='Only medical personnel can create events.'
				)

			serializer = self.get_serializer(
				data=request.data,
				context={'request': request}
			)
			
			if not serializer.is_valid():
				logger.warning(
					f"Invalid event creation data from {request.user}: "
					f"{serializer.errors}"
				)
				return Response({
					'error': 'Validation failed',
					'details': serializer.errors
				}, status=status.HTTP_400_BAD_REQUEST)

			serializer.save()
			created_event = serializer.instance
			matched_users_count = 0
			if created_event and created_event.event_location:
				matched_users = NormalUser.objects.filter(
					region__iexact=created_event.event_location.name,
					status='active',
				)
				event_users = [EventUser(event=created_event, user=normal_user) for normal_user in matched_users]
				if event_users:
					EventUser.objects.bulk_create(event_users)
					UserNotification.objects.bulk_create(
						[
							UserNotification(
								user=normal_user,
								event=created_event,
								notification_type=UserNotification.NotificationType.PROGRAM,
								title=f"New program in {created_event.event_location.name}",
								message=f"{created_event.name} has been scheduled in your district. Check Programs for details.",
							)
							for normal_user in matched_users
						]
					)
					matched_users_count = len(event_users)

			logger.info(
				f"Medical user {request.user} created event: {serializer.data.get('name')} "
				f"and linked {matched_users_count} users for notifications"
			)
			return Response({
				'message': 'Event created successfully',
				'linked_users': matched_users_count,
				'data': serializer.data
			}, status=status.HTTP_201_CREATED)

		except PermissionDenied as e:
			return Response({
				'error': str(e.detail)
			}, status=status.HTTP_403_FORBIDDEN)
		except Exception as e:
			logger.error(
				f"Error creating event for user {request.user}: {str(e)}",
				exc_info=True
			)
			return Response({
				'error': 'Failed to create event',
				'detail': 'An unexpected server error occurred.'
			}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

	def my_notifications(self, request):
		"""List event notifications for the logged-in normal user."""
		try:
			if not isinstance(request.user, NormalUser):
				raise PermissionDenied(detail='Only normal users can view personal notifications.')

			queryset = (
				UserNotification.objects.filter(user=request.user)
				.select_related('event', 'event__event_location')
				.order_by('-created_at')
			)

			results = [
				{
					'id': str(notification.id),
					'type': notification.notification_type,
					'title': notification.title,
					'message': notification.message,
					'date': notification.created_at.date().isoformat() if notification.created_at else None,
					'time': notification.created_at.strftime('%I:%M %p') if notification.created_at else None,
					'read': notification.is_read,
					'event_status': notification.event.event_status if notification.event else None,
					'location': notification.event.event_location.name if notification.event and notification.event.event_location else request.user.region or 'Unknown',
				}
				for notification in queryset
			]

			return Response(
				{
					'count': len(results),
					'results': results,
				},
				status=status.HTTP_200_OK,
			)
		except PermissionDenied as e:
			return Response({'error': str(e.detail)}, status=status.HTTP_403_FORBIDDEN)
		except Exception as e:
			logger.error(f"Error listing notifications for {request.user}: {str(e)}", exc_info=True)
			return Response(
				{
					'error': 'Failed to retrieve notifications',
					'detail': 'An unexpected server error occurred.',
				},
				status=status.HTTP_500_INTERNAL_SERVER_ERROR,
			)

	def dashboard_metrics(self, request):
		"""Return healthcare dashboard aggregates from live database values."""
		try:
			if not isinstance(request.user, MedicalPersonnel):
				raise PermissionDenied(detail='Only medical personnel can view dashboard metrics.')

			total_citizens = NormalUser.objects.count()
			upcoming_events = Event.objects.exclude(event_status='ENDED').count()
			total_vaccine_history = IndividualVaccinationRecord.objects.count()
			pending_follow_ups = IndividualVaccinationRecord.objects.filter(
				Q(status='scheduled') | Q(status='missed')
			).count()
			completed_follow_ups = IndividualVaccinationRecord.objects.filter(status='completed').count()

			return Response(
				{
					'total_citizens': total_citizens,
					'upcoming_events': upcoming_events,
					'total_vaccine_history': total_vaccine_history,
					'pending_follow_ups': pending_follow_ups,
					'completed_follow_ups': completed_follow_ups,
				},
				status=status.HTTP_200_OK,
			)
		except PermissionDenied as e:
			return Response({'error': str(e.detail)}, status=status.HTTP_403_FORBIDDEN)
		except Exception as e:
			logger.error(f"Error loading dashboard metrics for {request.user}: {str(e)}", exc_info=True)
			return Response(
				{
					'error': 'Failed to load dashboard metrics',
					'detail': 'An unexpected server error occurred.',
				},
				status=status.HTTP_500_INTERNAL_SERVER_ERROR,
			)

	def register_for_event(self, request, pk=None):
		"""Allow normal users to register themselves for an event."""
		try:
			if not isinstance(request.user, NormalUser):
				raise PermissionDenied(detail='Only normal users can register for events.')

			event = self.get_object()
			link, created = EventUser.objects.get_or_create(event=event, user=request.user)
			if created:
				UserNotification.objects.create(
					user=request.user,
					event=event,
					notification_type=UserNotification.NotificationType.PROGRAM,
					title='Program registration confirmed',
					message=f'You are registered for {event.name}.',
				)
				return Response(
					{'message': 'Registered for program successfully.'},
					status=status.HTTP_201_CREATED,
				)

			return Response(
				{'message': 'You are already registered for this program.'},
				status=status.HTTP_200_OK,
			)
		except PermissionDenied as e:
			return Response({'error': str(e.detail)}, status=status.HTTP_403_FORBIDDEN)
		except Exception as e:
			logger.error(f"Error registering user {request.user} for event {pk}: {str(e)}", exc_info=True)
			return Response(
				{
					'error': 'Failed to register for program',
					'detail': 'An unexpected server error occurred.',
				},
				status=status.HTTP_500_INTERNAL_SERVER_ERROR,
			)

	def update(self, request, pk=None):
		"""Update an existing event (medical personnel only, full update)."""
		try:
			instance = self.get_object()

			# Verify user is medical personnel and owns the event
			if not isinstance(request.user, MedicalPersonnel):
				logger.warning(
					f"Non-medical user {request.user} attempted to update event {pk}"
				)
				raise PermissionDenied(
					detail='Only medical personnel can update events.'
				)

			if instance.organized_by != request.user:
				logger.warning(
					f"Medical user {request.user} attempted to update event {pk} "
					f"organized by {instance.organized_by}"
				)
				raise PermissionDenied(
					detail='You can only update events you organized.'
				)

			serializer = self.get_serializer(
				instance,
				data=request.data,
				context={'request': request}
			)

			if not serializer.is_valid():
				logger.warning(
					f"Invalid event update data from {request.user}: "
					f"{serializer.errors}"
				)
				return Response({
					'error': 'Validation failed',
					'details': serializer.errors
				}, status=status.HTTP_400_BAD_REQUEST)

			serializer.save()
			logger.info(f"Event {pk} updated by {request.user}")
			return Response({
				'message': 'Event updated successfully',
				'data': serializer.data
			}, status=status.HTTP_200_OK)

		except Event.DoesNotExist:
			logger.warning(f"Event {pk} not found for update")
			return Response({
				'error': 'Event not found',
				'detail': f'Event with ID {pk} does not exist.'
			}, status=status.HTTP_404_NOT_FOUND)
		except PermissionDenied as e:
			return Response({
				'error': str(e.detail)
			}, status=status.HTTP_403_FORBIDDEN)
		except Exception as e:
			logger.error(
				f"Error updating event {pk}: {str(e)}",
				exc_info=True
			)
			return Response({
				'error': 'Failed to update event',
				'detail': 'An unexpected server error occurred.'
			}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

	def partial_update(self, request, pk=None):
		"""Partial update an existing event (medical personnel only)."""
		try:
			instance = self.get_object()

			# Verify user is medical personnel and owns the event
			if not isinstance(request.user, MedicalPersonnel):
				logger.warning(
					f"Non-medical user {request.user} attempted to partially update event {pk}"
				)
				raise PermissionDenied(
					detail='Only medical personnel can update events.'
				)

			if instance.organized_by != request.user:
				logger.warning(
					f"Medical user {request.user} attempted to partially update event {pk} "
					f"organized by {instance.organized_by}"
				)
				raise PermissionDenied(
					detail='You can only update events you organized.'
				)

			serializer = self.get_serializer(
				instance,
				data=request.data,
				partial=True,
				context={'request': request}
			)

			if not serializer.is_valid():
				logger.warning(
					f"Invalid event partial update data from {request.user}: "
					f"{serializer.errors}"
				)
				return Response({
					'error': 'Validation failed',
					'details': serializer.errors
				}, status=status.HTTP_400_BAD_REQUEST)

			serializer.save()
			logger.info(f"Event {pk} partially updated by {request.user}")
			return Response({
				'message': 'Event updated successfully',
				'data': serializer.data
			}, status=status.HTTP_200_OK)

		except Event.DoesNotExist:
			logger.warning(f"Event {pk} not found for partial update")
			return Response({
				'error': 'Event not found',
				'detail': f'Event with ID {pk} does not exist.'
			}, status=status.HTTP_404_NOT_FOUND)
		except PermissionDenied as e:
			return Response({
				'error': str(e.detail)
			}, status=status.HTTP_403_FORBIDDEN)
		except Exception as e:
			logger.error(
				f"Error partially updating event {pk}: {str(e)}",
				exc_info=True
			)
			return Response({
				'error': 'Failed to update event',
				'detail': 'An unexpected server error occurred.'
			}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

	def destroy(self, request, pk=None):
		"""Delete an event (medical personnel only)."""
		try:
			instance = self.get_object()

			# Verify user is medical personnel and owns the event
			if not isinstance(request.user, MedicalPersonnel):
				logger.warning(
					f"Non-medical user {request.user} attempted to delete event {pk}"
				)
				raise PermissionDenied(
					detail='Only medical personnel can delete events.'
				)

			if instance.organized_by != request.user:
				logger.warning(
					f"Medical user {request.user} attempted to delete event {pk} "
					f"organized by {instance.organized_by}"
				)
				raise PermissionDenied(
					detail='You can only delete events you organized.'
				)

			event_name = instance.name
			instance.delete()
			logger.info(f"Event {pk} ({event_name}) deleted by {request.user}")
			return Response({
				'message': f'Event "{event_name}" deleted successfully'
			}, status=status.HTTP_204_NO_CONTENT)

		except Event.DoesNotExist:
			logger.warning(f"Event {pk} not found for deletion")
			return Response({
				'error': 'Event not found',
				'detail': f'Event with ID {pk} does not exist.'
			}, status=status.HTTP_404_NOT_FOUND)
		except PermissionDenied as e:
			return Response({
				'error': str(e.detail)
			}, status=status.HTTP_403_FORBIDDEN)
		except Exception as e:
			logger.error(
				f"Error deleting event {pk}: {str(e)}",
				exc_info=True
			)
			return Response({
				'error': 'Failed to delete event',
				'detail': 'An unexpected server error occurred.'
			}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VaccinationViewSet(GenericViewSet):
	"""Medical personnel can list, retrieve, create and update vaccinations."""

	queryset = Vaccination.objects.all().order_by('vaccination_name')
	serializer_class = VaccinationSerializer
	permission_classes = [IsAuthenticated, IsMedicalPersonnel]

	def list(self, request):
		try:
			queryset = self.get_queryset()
			serializer = self.get_serializer(queryset, many=True)
			logger.info(f"Medical user {request.user} listed {len(queryset)} vaccinations")
			return Response({
				'count': len(queryset),
				'results': serializer.data
			}, status=status.HTTP_200_OK)
		except Exception as e:
			logger.error(f"Error listing vaccinations: {str(e)}", exc_info=True)
			return Response({
				'error': 'Failed to retrieve vaccinations',
				'detail': 'An unexpected server error occurred.'
			}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

	def retrieve(self, request, pk=None):
		try:
			instance = self.get_object()
			serializer = self.get_serializer(instance)
			logger.info(f"Medical user {request.user} retrieved vaccination {pk}")
			return Response(serializer.data, status=status.HTTP_200_OK)
		except Vaccination.DoesNotExist:
			logger.warning(f"Vaccination {pk} not found")
			return Response({
				'error': 'Vaccination not found',
				'detail': f'Vaccination with ID {pk} does not exist.'
			}, status=status.HTTP_404_NOT_FOUND)
		except Exception as e:
			logger.error(f"Error retrieving vaccination {pk}: {str(e)}", exc_info=True)
			return Response({
				'error': 'Failed to retrieve vaccination',
				'detail': 'An unexpected server error occurred.'
			}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

	def create(self, request):
		try:
			serializer = self.get_serializer(data=request.data)
			if not serializer.is_valid():
				logger.warning(
					f"Invalid vaccination creation data: {serializer.errors}"
				)
				return Response({
					'error': 'Validation failed',
					'details': serializer.errors
				}, status=status.HTTP_400_BAD_REQUEST)

			serializer.save()
			logger.info(
				f"Medical user {request.user} created vaccination: "
				f"{serializer.data.get('vaccination_name')}"
			)
			return Response({
				'message': 'Vaccination created successfully',
				'data': serializer.data
			}, status=status.HTTP_201_CREATED)
		except Exception as e:
			logger.error(
				f"Error creating vaccination: {str(e)}",
				exc_info=True
			)
			return Response({
				'error': 'Failed to create vaccination',
				'detail': 'An unexpected server error occurred.'
			}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

	def update(self, request, pk=None):
		try:
			instance = self.get_object()
			serializer = self.get_serializer(instance, data=request.data)
			if not serializer.is_valid():
				logger.warning(
					f"Invalid vaccination update data: {serializer.errors}"
				)
				return Response({
					'error': 'Validation failed',
					'details': serializer.errors
				}, status=status.HTTP_400_BAD_REQUEST)

			serializer.save()
			logger.info(f"Vaccination {pk} updated by {request.user}")
			return Response({
				'message': 'Vaccination updated successfully',
				'data': serializer.data
			}, status=status.HTTP_200_OK)
		except Vaccination.DoesNotExist:
			logger.warning(f"Vaccination {pk} not found for update")
			return Response({
				'error': 'Vaccination not found',
				'detail': f'Vaccination with ID {pk} does not exist.'
			}, status=status.HTTP_404_NOT_FOUND)
		except Exception as e:
			logger.error(
				f"Error updating vaccination {pk}: {str(e)}",
				exc_info=True
			)
			return Response({
				'error': 'Failed to update vaccination',
				'detail': 'An unexpected server error occurred.'
			}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

	def partial_update(self, request, pk=None):
		try:
			instance = self.get_object()
			serializer = self.get_serializer(instance, data=request.data, partial=True)
			if not serializer.is_valid():
				logger.warning(
					f"Invalid vaccination partial update data: {serializer.errors}"
				)
				return Response({
					'error': 'Validation failed',
					'details': serializer.errors
				}, status=status.HTTP_400_BAD_REQUEST)

			serializer.save()
			logger.info(f"Vaccination {pk} partially updated by {request.user}")
			return Response({
				'message': 'Vaccination updated successfully',
				'data': serializer.data
			}, status=status.HTTP_200_OK)
		except Vaccination.DoesNotExist:
			logger.warning(f"Vaccination {pk} not found for partial update")
			return Response({
				'error': 'Vaccination not found',
				'detail': f'Vaccination with ID {pk} does not exist.'
			}, status=status.HTTP_404_NOT_FOUND)
		except Exception as e:
			logger.error(
				f"Error partially updating vaccination {pk}: {str(e)}",
				exc_info=True
			)
			return Response({
				'error': 'Failed to update vaccination',
				'detail': 'An unexpected server error occurred.'
			}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)