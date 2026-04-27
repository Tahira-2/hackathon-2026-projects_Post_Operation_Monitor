from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import serializers

from user.models import UserProfile

from .models import (
    ExerciseResult,
    ExerciseSession,
    ExerciseTemplate,
    RehabPlan,
    RehabPlanExercise,
    DoctorFeedback,
)


User = get_user_model()


class ExerciseTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExerciseTemplate
        fields = [
            "id",
            "name",
            "description",
            "target_joint",
            "instructions",
            "min_angle",
            "max_angle",
        ]


class RehabPlanExerciseWriteSerializer(serializers.Serializer):
    exercise_id = serializers.IntegerField(min_value=1)
    order = serializers.IntegerField(min_value=1)
    target_reps = serializers.IntegerField(min_value=0)


class RehabPlanCreateSerializer(serializers.Serializer):
    patient_id = serializers.IntegerField(min_value=1)
    name = serializers.CharField(max_length=120)
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    tasks = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    weekly_goal = serializers.IntegerField(min_value=1, max_value=7, required=False, default=6)
    exercises = RehabPlanExerciseWriteSerializer(many=True, required=False, default=list)

    def validate(self, data):
        exercises = data.get("exercises", [])
        tasks = data.get("tasks", [])
        if not exercises and not tasks:
            raise serializers.ValidationError("At least one exercise or one task must be provided.")
        
        start_date = data.get("start_date")
        end_date = data.get("end_date")
        
        if start_date and end_date:
            if start_date > end_date:
                raise serializers.ValidationError({"end_date": "End date cannot be before start date."})
            if end_date < timezone.now().date():
                raise serializers.ValidationError({"end_date": "End date cannot be in the past."})
                
        return data

    def validate_patient_id(self, value):
        try:
            patient = User.objects.get(id=value)
        except User.DoesNotExist as error:
            raise serializers.ValidationError("Patient does not exist.") from error

        patient_profile = getattr(patient, "profile", None)
        if not patient_profile or patient_profile.role != UserProfile.ROLE_PATIENT:
            raise serializers.ValidationError("patient_id must belong to a patient user.")

        self.context["patient_obj"] = patient
        return value

    def validate_exercises(self, value):
        if not value:
            return value

        seen_orders = set()
        exercise_ids = []
        for item in value:
            order = item["order"]
            if order in seen_orders:
                raise serializers.ValidationError("Exercise order values must be unique.")
            seen_orders.add(order)
            exercise_ids.append(item["exercise_id"])

        templates = ExerciseTemplate.objects.filter(id__in=exercise_ids)
        found_ids = {template.id for template in templates}
        missing_ids = [exercise_id for exercise_id in set(exercise_ids) if exercise_id not in found_ids]
        if missing_ids:
            raise serializers.ValidationError(
                "Invalid exercise_id values: " + ", ".join(str(item) for item in sorted(missing_ids))
            )

        self.context["template_map"] = {template.id: template for template in templates}
        return value

    def create(self, validated_data):
        doctor = self.context["request"].user
        patient = self.context["patient_obj"]
        template_map = self.context["template_map"]

        plan = RehabPlan.objects.create(
            doctor=doctor,
            patient=patient,
            name=validated_data["name"],
            start_date=validated_data["start_date"],
            end_date=validated_data["end_date"],
            tasks=validated_data.get("tasks", [])
        )

        plan_links = []
        for item in validated_data["exercises"]:
            plan_links.append(
                RehabPlanExercise(
                    plan=plan,
                    exercise=template_map[item["exercise_id"]],
                    order=item["order"],
                    target_reps=item["target_reps"],
                )
            )

        RehabPlanExercise.objects.bulk_create(plan_links)
        return plan


class RehabPlanExerciseDetailSerializer(serializers.ModelSerializer):
    exercise = ExerciseTemplateSerializer(read_only=True)

    class Meta:
        model = RehabPlanExercise
        fields = ["order", "target_reps", "exercise"]


class RehabPlanDetailSerializer(serializers.ModelSerializer):
    doctor_id = serializers.IntegerField(source="doctor.id", read_only=True)
    patient_id = serializers.IntegerField(source="patient.id", read_only=True)
    exercises = serializers.SerializerMethodField()

    class Meta:
        model = RehabPlan
        fields = ["id", "doctor_id", "patient_id", "name", "start_date", "end_date", "is_active", "tasks", "created_at", "exercises"]

    def get_exercises(self, obj):
        links = obj.plan_exercises.select_related("exercise").order_by("order", "id")
        return RehabPlanExerciseDetailSerializer(links, many=True).data


class ExerciseResultInputSerializer(serializers.Serializer):
    name = serializers.CharField()
    reps = serializers.IntegerField(min_value=0)
    accuracy = serializers.FloatField(min_value=0.0, max_value=100.0)
    duration = serializers.FloatField(min_value=0.0)


class SessionStartSerializer(serializers.Serializer):
    plan_id = serializers.IntegerField(min_value=1)


class SessionCompleteSerializer(serializers.Serializer):
    completed_at = serializers.DateTimeField(required=False)
    exercise_results = ExerciseResultInputSerializer(many=True)
    body_part_scores = serializers.ListField(child=serializers.DictField(), required=False, default=list)

    def validate_exercise_results(self, value):
        if not value:
            raise serializers.ValidationError("exercise_results must include at least one entry.")

        names = [item["name"] for item in value]
        templates = ExerciseTemplate.objects.filter(name__in=names)
        template_map = {template.name: template for template in templates}
        
        missing_names = [name for name in set(names) if name not in template_map]
        if missing_names:
            raise serializers.ValidationError(
                "Invalid exercise names: " + ", ".join(sorted(missing_names))
            )

        self.context["template_map"] = template_map
        return value

    def save_results(self, session):
        template_map = self.context["template_map"]
        results_payload = self.validated_data["exercise_results"]
        body_part_scores = self.validated_data.get("body_part_scores", [])
        completed_at = self.validated_data.get("completed_at") or timezone.now()

        session.results.all().delete()

        results = []
        for idx, item in enumerate(results_payload):
            results.append(
                ExerciseResult(
                    session=session,
                    exercise=template_map[item["name"]],
                    reps=item["reps"],
                    accuracy=item["accuracy"],
                    duration=item["duration"],
                    order=idx + 1,
                )
            )

        ExerciseResult.objects.bulk_create(results)
        session.completed_at = completed_at
        session.body_part_scores = body_part_scores
        session.save(update_fields=["completed_at", "body_part_scores"])
        return session


class ExerciseResultSerializer(serializers.ModelSerializer):
    exercise_id = serializers.IntegerField(source="exercise.id", read_only=True)
    exercise_name = serializers.CharField(source="exercise.name", read_only=True)

    class Meta:
        model = ExerciseResult
        fields = ["order", "exercise_id", "exercise_name", "reps", "accuracy", "duration"]


class ExerciseSessionSerializer(serializers.ModelSerializer):
    plan_id = serializers.IntegerField(source="plan.id", read_only=True)
    plan_name = serializers.CharField(source="plan.name", read_only=True)
    doctor_name = serializers.SerializerMethodField()
    patient_id = serializers.IntegerField(source="patient.id", read_only=True)
    results = serializers.SerializerMethodField()
    feedback = serializers.SerializerMethodField()

    class Meta:
        model = ExerciseSession
        fields = ["id", "patient_id", "plan_id", "plan_name", "doctor_name", "started_at", "completed_at", "body_part_scores", "results", "feedback"]

    def get_doctor_name(self, obj):
        doc = obj.plan.doctor
        return f"{doc.first_name} {doc.last_name}" if doc.first_name else doc.username

    def get_results(self, obj):
        rows = obj.results.select_related("exercise").order_by("order", "id")
        return ExerciseResultSerializer(rows, many=True).data

    def get_feedback(self, obj):
        feedback = obj.feedback.first()
        if feedback:
            return DoctorFeedbackSerializer(feedback).data
        return None

class DoctorFeedbackSerializer(serializers.ModelSerializer):
    patient_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='patient',
        write_only=True
    )
    session_id = serializers.PrimaryKeyRelatedField(
        queryset=ExerciseSession.objects.all(),
        source='session',
        write_only=True
    )
    patient = serializers.StringRelatedField(read_only=True)
    session = serializers.IntegerField(source='session.id', read_only=True)

    class Meta:
        model = DoctorFeedback
        fields = ["id", "doctor", "patient_id", "session_id", "patient", "session", "rating", "guidance", "created_at"]
        read_only_fields = ["doctor", "created_at"]

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

    def validate_guidance(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Guidance cannot be empty.")
        return value
