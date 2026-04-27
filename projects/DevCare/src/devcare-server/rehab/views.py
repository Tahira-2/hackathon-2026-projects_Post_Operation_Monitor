from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication



from user.models import UserProfile

from .models import ExerciseSession, ExerciseTemplate, RehabPlan,  ExerciseResult
from .serializers import (
	ExerciseSessionSerializer,
	ExerciseTemplateSerializer,
	RehabPlanCreateSerializer,
	RehabPlanDetailSerializer,
	SessionCompleteSerializer,
	SessionStartSerializer,
	DoctorFeedbackSerializer,
)
from .models import DoctorFeedback


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

		session = get_object_or_404(ExerciseSession, id=session_id)

		if session.patient_id != request.user.id:
			return Response(
				{"detail": "You can only complete your own sessions."},
				status=status.HTTP_403_FORBIDDEN,
			)

		if session.completed_at is not None:
			return Response(
				{"detail": "Session is already completed."},
				status=status.HTTP_400_BAD_REQUEST,
			)

		exercise_results = request.data.get("exercise_results", [])
		body_part_scores = request.data.get("body_part_scores", [])

		if not isinstance(exercise_results, list) or not isinstance(body_part_scores, list):
			return Response(
				{"detail": "Both exercise_results and body_part_scores must be lists."},
				status=status.HTTP_400_BAD_REQUEST,
			)

		results_to_create = []
		for idx, item in enumerate(exercise_results):
			name = item.get("name")
			reps = item.get("reps", 0)
			accuracy = item.get("accuracy", 0.0)
			duration = item.get("duration", 0.0)
			
			if not name:
				continue
				
			exercise = ExerciseTemplate.objects.filter(name=name).first()
			if not exercise:
				continue
				
			results_to_create.append(
				ExerciseResult(
					session=session,
					exercise=exercise,
					reps=reps,
					accuracy=accuracy,
					duration=duration,
					order=idx + 1
				)
			)

		ExerciseResult.objects.bulk_create(results_to_create)

		from django.utils import timezone
		session.body_part_scores = body_part_scores
		session.completed_at = timezone.now()
		session.save(update_fields=["body_part_scores", "completed_at"])

		return Response({
			"message": "Session completed successfully",
			"exercise_count": len(results_to_create)
		}, status=status.HTTP_200_OK)


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


class PatientPlanListView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request):
		profile = getattr(request.user, "profile", None)
		if not profile or profile.role != UserProfile.ROLE_PATIENT:
			return Response({"detail": "Only patients can view their assigned plans."}, status=status.HTTP_403_FORBIDDEN)

		from django.utils import timezone
		today = timezone.now().date()
		
		plans = RehabPlan.objects.filter(
			patient=request.user,
			is_active=True,
			start_date__lte=today,
			end_date__gte=today
		).prefetch_related("plan_exercises__exercise")
		
		serializer = RehabPlanDetailSerializer(plans, many=True)
		return Response(serializer.data, status=status.HTTP_200_OK)


class MySessionHistoryView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request):
		profile = getattr(request.user, "profile", None)
		if not profile or profile.role != UserProfile.ROLE_PATIENT:
			return Response({"detail": "Only patients can view their history."}, status=status.HTTP_403_FORBIDDEN)

		sessions = ExerciseSession.objects.filter(patient=request.user).order_by("-started_at")
		serializer = ExerciseSessionSerializer(sessions, many=True)
		return Response(serializer.data, status=status.HTTP_200_OK)


class SessionDetailView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request, session_id):
		session = get_object_or_404(ExerciseSession, id=session_id)
		
		# Check ownership
		profile = getattr(request.user, "profile", None)
		if session.patient_id != request.user.id and (not profile or profile.role != UserProfile.ROLE_DOCTOR):
			return Response({"detail": "You do not have permission to view this session."}, status=status.HTTP_403_FORBIDDEN)

		serializer = ExerciseSessionSerializer(session)
		return Response(serializer.data, status=status.HTTP_200_OK)

class DoctorFeedbackCreateView(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request):
		profile = getattr(request.user, "profile", None)
		if not profile or profile.role != UserProfile.ROLE_DOCTOR:
			return Response({"detail": "Only doctors can submit feedback."}, status=status.HTTP_403_FORBIDDEN)

		serializer = DoctorFeedbackSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)

		session = serializer.validated_data["session"]
		patient = serializer.validated_data["patient"]
		
		if session.patient != patient:
			return Response({"detail": "Session does not belong to the specified patient."}, status=status.HTTP_400_BAD_REQUEST)
			
		if DoctorFeedback.objects.filter(session=session).exists():
			return Response({"detail": "Feedback already submitted for this session."}, status=status.HTTP_400_BAD_REQUEST)

		feedback = serializer.save(doctor=request.user)
		return Response(DoctorFeedbackSerializer(feedback).data, status=status.HTTP_201_CREATED)


class DashboardStatsView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request):
		profile = getattr(request.user, "profile", None)
		role = getattr(profile, "role", UserProfile.ROLE_PATIENT)

		if role == UserProfile.ROLE_DOCTOR:
			from connections.models import DoctorPatientRelation
			from django.db.models import Count, Avg
			
			total_patients = DoctorPatientRelation.objects.filter(doctor=request.user).count()
			
			# Sessions for plans created by this doctor
			doctor_sessions = ExerciseSession.objects.filter(plan__doctor=request.user)
			total_sessions = doctor_sessions.filter(completed_at__isnull=False).count()
			
			# Recent patients (unique patients with sessions in the last 30 days)
			from django.utils import timezone
			thirty_days_ago = timezone.now() - timezone.timedelta(days=30)
			
			recent_patient_ids = doctor_sessions.filter(
				started_at__gte=thirty_days_ago
			).values_list('patient_id', flat=True).distinct()[:5]
			
			from django.contrib.auth import get_user_model
			User = get_user_model()
			recent_patients_objs = User.objects.filter(id__in=recent_patient_ids)
			
			recent_patients = []
			for p in recent_patients_objs:
				last_session = doctor_sessions.filter(patient=p, completed_at__isnull=False).order_by("-completed_at").first()
				avg_accuracy = ExerciseResult.objects.filter(session__patient=p, session__plan__doctor=request.user).aggregate(Avg('accuracy'))['accuracy__avg'] or 0
				
				recent_patients.append({
					"id": p.id,
					"username": p.username,
					"initials": "".join([n[0] for n in p.username.split()[:2]]).upper(),
					"progress": round(avg_accuracy * 100, 1) if avg_accuracy else 0,
					"last_activity": last_session.completed_at.strftime("%Y-%m-%d %H:%M") if last_session else "No activity"
				})

			return Response({
				"role": "doctor",
				"stats": [
					{"label": "Total Patients", "val": str(total_patients), "icon": "Users", "color": "bg-blue-50 text-blue-600"},
					{"label": "Total Sessions", "val": str(total_sessions), "icon": "Activity", "color": "bg-green-50 text-green-600"},
					{"label": "New Requests", "val": "0", "icon": "PlusCircle", "color": "bg-orange-50 text-orange-600"}, # Placeholder
				],
				"recent_patients": recent_patients
			})

		else:  # Patient role
			from django.db.models import Avg
			from django.utils import timezone
			
			# Get latest plan
			latest_plan = RehabPlan.objects.filter(patient=request.user).order_by("-created_at").first()
			
			# Sessions this week
			start_of_week = timezone.now().date() - timezone.timedelta(days=timezone.now().weekday())
			sessions_this_week = ExerciseSession.objects.filter(
				patient=request.user, 
				completed_at__date__gte=start_of_week
			).count()
			
			# Total consistency
			total_sessions = ExerciseSession.objects.filter(patient=request.user, completed_at__isnull=False).count()
			
			# Average accuracy
			avg_accuracy_data = ExerciseResult.objects.filter(
				session__patient=request.user, 
				session__completed_at__isnull=False
			).aggregate(Avg('accuracy'))['accuracy__avg']
			avg_accuracy = avg_accuracy_data or 0
			
			# Latest feedback
			latest_feedback = DoctorFeedback.objects.filter(patient=request.user).order_by("-created_at").first()
			
			# Calculate streak
			all_session_dates = ExerciseSession.objects.filter(
				patient=request.user, 
				completed_at__isnull=False
			).values_list('completed_at__date', flat=True).distinct().order_by("-completed_at__date")
			
			streak = 0
			if all_session_dates:
				current_date = timezone.now().date()
				last_completed_date = all_session_dates[0]
				
				# If they finished one today or yesterday, continue streak
				if last_completed_date == current_date or last_completed_date == current_date - timezone.timedelta(days=1):
					streak = 1
					for i in range(len(all_session_dates) - 1):
						if all_session_dates[i] - timezone.timedelta(days=1) == all_session_dates[i+1]:
							streak += 1
						else:
							break

			# Accuracy History (last 7 days)
			from django.db.models import Avg
			accuracy_history = []
			session_history = []
			today = timezone.now().date()
			
			for i in range(6, -1, -1):
				day = today - timezone.timedelta(days=i)
				day_sessions = ExerciseSession.objects.filter(
					patient=request.user,
					completed_at__date=day
				)
				
				# Accuracy point
				if day_sessions.exists():
					day_avg = ExerciseResult.objects.filter(session__in=day_sessions).aggregate(Avg('accuracy'))['accuracy__avg'] or 0
					acc_val = round(day_avg * 100, 1) if day_avg <= 1 else round(day_avg, 1)
				else:
					acc_val = 0
					
				accuracy_history.append({
					"date": day.strftime("%m/%d"),
					"accuracy": acc_val
				})
				
				# Session count point
				session_history.append({
					"date": day.strftime("%a"),
					"count": day_sessions.count()
				})

			# Assigned exercises from current plan
			exercises = []
			if latest_plan:
				plan_exercises = latest_plan.plan_exercises.all().select_related('exercise')
				for pe in plan_exercises:
					exercises.append({
						"name": pe.exercise.name,
						"sets": f"3x{pe.target_reps}",
						"difficulty": "Intermediate", # Hardcoded for now
						"status": "pending" # Would need session tracking
					})

			return Response({
				"role": "patient",
				"score": round(avg_accuracy * 100),
				"consistency": total_sessions,
				"weekly_done": sessions_this_week,
				"weekly_goal": latest_plan.weekly_goal if latest_plan else 6,
				"streak": streak,
				"therapy_window": {
					"start": latest_plan.created_at.strftime("%b %d") if latest_plan else "N/A",
					"end": (latest_plan.created_at + timezone.timedelta(days=28)).strftime("%b %d") if latest_plan else "N/A"
				},
				"accuracy_history": accuracy_history,
				"session_history": session_history,
				"current_plan_name": latest_plan.name if latest_plan else "No Active Plan",
				"doctor_name": latest_plan.doctor.username if latest_plan else "No Doctor Assigned",
				"exercises": exercises,
				"latest_feedback": {
					"guidance": latest_feedback.guidance if latest_feedback else "No feedback yet.",
					"date": latest_feedback.created_at.strftime("%b %d, %Y") if latest_feedback else "N/A"
				}
			})
