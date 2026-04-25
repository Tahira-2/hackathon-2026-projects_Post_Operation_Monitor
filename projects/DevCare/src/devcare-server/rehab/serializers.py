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
    exercises = RehabPlanExerciseWriteSerializer(many=True)

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
            raise serializers.ValidationError("At least one exercise is required.")

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
        fields = ["id", "doctor_id", "patient_id", "name", "created_at", "exercises"]

    def get_exercises(self, obj):
        links = obj.plan_exercises.select_related("exercise").order_by("order", "id")
        return RehabPlanExerciseDetailSerializer(links, many=True).data


class ExerciseResultInputSerializer(serializers.Serializer):
    exercise_id = serializers.IntegerField(min_value=1)
    reps = serializers.IntegerField(min_value=0)
    accuracy = serializers.FloatField(min_value=0.0, max_value=100.0)
    duration = serializers.FloatField(min_value=0.0)
    order = serializers.IntegerField(min_value=1)


class SessionStartSerializer(serializers.Serializer):
    plan_id = serializers.IntegerField(min_value=1)


class SessionCompleteSerializer(serializers.Serializer):
    completed_at = serializers.DateTimeField(required=False)
    results = ExerciseResultInputSerializer(many=True)

    def validate_results(self, value):
        if not value:
            raise serializers.ValidationError("results must include at least one exercise result.")

        orders = set()
        exercise_ids = []
        for item in value:
            order = item["order"]
            if order in orders:
                raise serializers.ValidationError("Result order values must be unique.")
            orders.add(order)
            exercise_ids.append(item["exercise_id"])

        templates = ExerciseTemplate.objects.filter(id__in=exercise_ids)
        template_map = {template.id: template for template in templates}
        missing_ids = [exercise_id for exercise_id in set(exercise_ids) if exercise_id not in template_map]
        if missing_ids:
            raise serializers.ValidationError(
                "Invalid exercise_id values: " + ", ".join(str(item) for item in sorted(missing_ids))
            )

        self.context["template_map"] = template_map
        return value

    def save_results(self, session):
        template_map = self.context["template_map"]
        results_payload = self.validated_data["results"]
        completed_at = self.validated_data.get("completed_at") or timezone.now()

        session.results.all().delete()

        results = []
        for item in results_payload:
            results.append(
                ExerciseResult(
                    session=session,
                    exercise=template_map[item["exercise_id"]],
                    reps=item["reps"],
                    accuracy=item["accuracy"],
                    duration=item["duration"],
                    order=item["order"],
                )
            )

        ExerciseResult.objects.bulk_create(results)
        session.completed_at = completed_at
        session.save(update_fields=["completed_at"])
        return session


class ExerciseResultSerializer(serializers.ModelSerializer):
    exercise_id = serializers.IntegerField(source="exercise.id", read_only=True)
    exercise_name = serializers.CharField(source="exercise.name", read_only=True)

    class Meta:
        model = ExerciseResult
        fields = ["order", "exercise_id", "exercise_name", "reps", "accuracy", "duration"]


class ExerciseSessionSerializer(serializers.ModelSerializer):
    plan_id = serializers.IntegerField(source="plan.id", read_only=True)
    patient_id = serializers.IntegerField(source="patient.id", read_only=True)
    results = serializers.SerializerMethodField()

    class Meta:
        model = ExerciseSession
        fields = ["id", "patient_id", "plan_id", "started_at", "completed_at", "results"]

    def get_results(self, obj):
        rows = obj.results.select_related("exercise").order_by("order", "id")
        return ExerciseResultSerializer(rows, many=True).data
