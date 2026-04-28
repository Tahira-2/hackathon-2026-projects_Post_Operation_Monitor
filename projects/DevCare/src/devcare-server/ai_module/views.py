from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from user.models import UserProfile

from .models import ExerciseSession


User = get_user_model()


class UploadSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            patient = self._resolve_patient(request)
            payload = self._validate_payload(request.data)
        except ValueError as error:
            return Response({"detail": str(error)}, status=status.HTTP_400_BAD_REQUEST)

        ExerciseSession.objects.create(
            patient=patient,
            exercise=payload["exercise"],
            reps=payload["reps"],
            avg_range=payload["avg_range"],
            form_accuracy=payload["form_accuracy"],
            duration=payload["duration"],
        )

        return Response({"status": "saved"}, status=status.HTTP_201_CREATED)

    def _resolve_patient(self, request):
        request_user = request.user
        profile = getattr(request_user, "profile", None)
        role = getattr(profile, "role", None)

        if role == UserProfile.ROLE_PATIENT:
            return request_user

        if role == UserProfile.ROLE_DOCTOR:
            patient_id = request.data.get("patient_id")
            if not patient_id:
                raise ValueError("patient_id is required when doctor uploads a session.")

            try:
                patient = User.objects.get(id=int(patient_id))
            except (TypeError, ValueError):
                raise ValueError("patient_id must be a valid integer.") from None
            except User.DoesNotExist:
                raise ValueError("Patient not found.") from None

            patient_profile = getattr(patient, "profile", None)
            if not patient_profile or patient_profile.role != UserProfile.ROLE_PATIENT:
                raise ValueError("patient_id must belong to a patient user.")

            return patient

        raise ValueError("Only authenticated doctor or patient users can upload sessions.")

    def _validate_payload(self, data):
        exercise = str(data.get("exercise", "")).strip().lower()
        if not exercise:
            raise ValueError("exercise is required.")

        reps = self._as_int(data.get("reps"), field_name="reps", minimum=0)
        avg_range = self._as_float(data.get("avg_range"), field_name="avg_range", minimum=0.0)
        form_accuracy = self._as_float(
            data.get("form_accuracy"), field_name="form_accuracy", minimum=0.0, maximum=100.0
        )
        duration = self._as_float(data.get("duration"), field_name="duration", minimum=0.0)

        return {
            "exercise": exercise,
            "reps": reps,
            "avg_range": avg_range,
            "form_accuracy": form_accuracy,
            "duration": duration,
        }

    @staticmethod
    def _as_int(value, field_name, minimum=0):
        try:
            parsed = int(value)
        except (TypeError, ValueError):
            raise ValueError(f"{field_name} must be an integer.") from None

        if parsed < minimum:
            raise ValueError(f"{field_name} must be >= {minimum}.")
        return parsed

    @staticmethod
    def _as_float(value, field_name, minimum=0.0, maximum=None):
        try:
            parsed = float(value)
        except (TypeError, ValueError):
            raise ValueError(f"{field_name} must be a number.") from None

        if parsed < minimum:
            raise ValueError(f"{field_name} must be >= {minimum}.")
        if maximum is not None and parsed > maximum:
            raise ValueError(f"{field_name} must be <= {maximum}.")
        return parsed
