from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

from .ai_service import generate_rehab_plan, generate_chatbot_response

from user.models import UserProfile

from .models import ExerciseSession, ExerciseTemplate, RehabPlan
from .serializers import (
	ExerciseSessionSerializer,
	ExerciseTemplateSerializer,
	RehabPlanCreateSerializer,
	RehabPlanDetailSerializer,
	SessionCompleteSerializer,
	SessionStartSerializer,
)


class ExerciseTemplateListView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request):
		templates = ExerciseTemplate.objects.all().order_by("name")
		serializer = ExerciseTemplateSerializer(templates, many=True)
		return Response(serializer.data, status=status.HTTP_200_OK)


class ExerciseTemplateCreateView(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request):
		profile = getattr(request.user, "profile", None)
		if not profile or profile.role != UserProfile.ROLE_DOCTOR:
			return Response({"detail": "Only doctors can create exercise templates."}, status=status.HTTP_403_FORBIDDEN)

		serializer = ExerciseTemplateSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		serializer.save()
		return Response(serializer.data, status=status.HTTP_201_CREATED)


class RehabPlanCreateView(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request):
		profile = getattr(request.user, "profile", None)
		role = getattr(profile, "role", None)
		if role != UserProfile.ROLE_DOCTOR:
			return Response(
				{"detail": "Only doctor users can create rehab plans."},
				status=status.HTTP_403_FORBIDDEN,
			)

		serializer = RehabPlanCreateSerializer(data=request.data, context={"request": request})
		serializer.is_valid(raise_exception=True)
		plan = serializer.save()

		response_serializer = RehabPlanDetailSerializer(plan)
		return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class RehabPlanDetailView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request, plan_id):
		plan = get_object_or_404(
			RehabPlan.objects.select_related("doctor", "patient").prefetch_related("plan_exercises__exercise"),
			id=plan_id,
		)

		profile = getattr(request.user, "profile", None)
		role = getattr(profile, "role", None)

		if role == UserProfile.ROLE_DOCTOR and plan.doctor_id != request.user.id:
			return Response({"detail": "You can only view plans you created."}, status=status.HTTP_403_FORBIDDEN)

		if role == UserProfile.ROLE_PATIENT and plan.patient_id != request.user.id:
			return Response({"detail": "You can only view plans assigned to you."}, status=status.HTTP_403_FORBIDDEN)

		if role not in {UserProfile.ROLE_DOCTOR, UserProfile.ROLE_PATIENT}:
			return Response({"detail": "Access denied for this user role."}, status=status.HTTP_403_FORBIDDEN)

		serializer = RehabPlanDetailSerializer(plan)
		return Response(serializer.data, status=status.HTTP_200_OK)


class SessionStartView(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request):
		profile = getattr(request.user, "profile", None)
		role = getattr(profile, "role", None)
		if role != UserProfile.ROLE_PATIENT:
			return Response(
				{"detail": "Only patient users can start rehab sessions."},
				status=status.HTTP_403_FORBIDDEN,
			)

		serializer = SessionStartSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)

		plan = get_object_or_404(RehabPlan, id=serializer.validated_data["plan_id"])
		if plan.patient_id != request.user.id:
			return Response(
				{"detail": "You can only start sessions for plans assigned to you."},
				status=status.HTTP_403_FORBIDDEN,
			)

		session = ExerciseSession.objects.create(patient=request.user, plan=plan)
		response_serializer = ExerciseSessionSerializer(session)
		return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class SessionCompleteView(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request, session_id):
		profile = getattr(request.user, "profile", None)
		role = getattr(profile, "role", None)
		if role != UserProfile.ROLE_PATIENT:
			return Response(
				{"detail": "Only patient users can complete rehab sessions."},
				status=status.HTTP_403_FORBIDDEN,
			)

		session = get_object_or_404(
			ExerciseSession.objects.select_related("patient", "plan").prefetch_related("plan__plan_exercises"),
			id=session_id,
		)

		if session.patient_id != request.user.id:
			return Response(
				{"detail": "You can only complete your own sessions."},
				status=status.HTTP_403_FORBIDDEN,
			)

		serializer = SessionCompleteSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)

		allowed_exercise_ids = set(
			session.plan.plan_exercises.values_list("exercise_id", flat=True)
		)
		submitted_exercise_ids = {
			item["exercise_id"] for item in serializer.validated_data["results"]
		}
		invalid_ids = sorted(submitted_exercise_ids - allowed_exercise_ids)
		if invalid_ids:
			return Response(
				{
					"detail": "Submitted results include exercises not assigned in this plan.",
					"exercise_ids": invalid_ids,
				},
				status=status.HTTP_400_BAD_REQUEST,
			)

		session = serializer.save_results(session)
		response_serializer = ExerciseSessionSerializer(session)
		return Response(response_serializer.data, status=status.HTTP_200_OK)


class PatientSessionHistoryView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request, patient_id):
		profile = getattr(request.user, "profile", None)
		if not profile or profile.role != UserProfile.ROLE_DOCTOR:
			return Response({"detail": "Only doctors can view patient history."}, status=status.HTTP_403_FORBIDDEN)

		sessions = ExerciseSession.objects.filter(patient_id=patient_id).order_by("-started_at")
		serializer = ExerciseSessionSerializer(sessions, many=True)
		return Response(serializer.data, status=status.HTTP_200_OK)


class PatientStreakView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request, patient_id):
		profile = getattr(request.user, "profile", None)
		if not profile or profile.role != UserProfile.ROLE_DOCTOR:
			return Response({"detail": "Only doctors can view patient streak data."}, status=status.HTTP_403_FORBIDDEN)

		dates = ExerciseSession.objects.filter(
			patient_id=patient_id, 
			completed_at__isnull=False
		).values_list('completed_at__date', flat=True).distinct().order_by("-completed_at__date")

		return Response({
			"patient_id": patient_id,
			"active_days": list(dates),
			"total_days": len(dates)
		}, status=status.HTTP_200_OK)


class RehabPlanGenerateView(APIView):
	authentication_classes = [JWTAuthentication]
	permission_classes = [IsAuthenticated]

	def post(self, request):
		profile = getattr(request.user, "profile", None)
		role = getattr(profile, "role", None)
		if role != UserProfile.ROLE_DOCTOR:
			return Response(
				{"detail": "Only doctor users can generate AI rehab plans."},
				status=status.HTTP_403_FORBIDDEN,
			)

		plan_data = generate_rehab_plan(request.data)
		return Response(plan_data, status=status.HTTP_200_OK)


class CareBotAIView(APIView):
	authentication_classes = [JWTAuthentication]
	permission_classes = [IsAuthenticated]

	def post(self, request):
		query = request.data.get("query")
		if not query:
			return Response({"detail": "query is required."}, status=status.HTTP_400_BAD_REQUEST)

		response_data = generate_chatbot_response(query)
		return Response(response_data, status=status.HTTP_200_OK)

