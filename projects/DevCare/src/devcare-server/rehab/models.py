from django.conf import settings
from django.db import models


class ExerciseTemplate(models.Model):
	name = models.CharField(max_length=100, unique=True)
	description = models.TextField(blank=True)
	target_joint = models.CharField(max_length=100)
	instructions = models.TextField(blank=True)
	min_angle = models.FloatField()
	max_angle = models.FloatField()

	class Meta:
		ordering = ["name"]

	def __str__(self):
		return self.name


class RehabPlan(models.Model):
	doctor = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name="rehab_plans_created",
	)
	patient = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name="rehab_plans_assigned",
	)
	name = models.CharField(max_length=120)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ["-created_at"]

	def __str__(self):
		return f"{self.name} ({self.patient})"


class RehabPlanExercise(models.Model):
	plan = models.ForeignKey(
		RehabPlan,
		on_delete=models.CASCADE,
		related_name="plan_exercises",
	)
	exercise = models.ForeignKey(
		ExerciseTemplate,
		on_delete=models.CASCADE,
		related_name="plan_links",
	)
	order = models.PositiveIntegerField()
	target_reps = models.PositiveIntegerField(default=0)

	class Meta:
		ordering = ["order", "id"]
		unique_together = ("plan", "order")

	def __str__(self):
		return f"{self.plan.name} - #{self.order} {self.exercise.name}"


class ExerciseSession(models.Model):
	patient = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name="rehab_sessions",
	)
	plan = models.ForeignKey(
		RehabPlan,
		on_delete=models.CASCADE,
		related_name="sessions",
	)
	started_at = models.DateTimeField(auto_now_add=True)
	completed_at = models.DateTimeField(null=True, blank=True)

	class Meta:
		ordering = ["-started_at"]

	def __str__(self):
		return f"Session #{self.id} - {self.patient}"


class ExerciseResult(models.Model):
	session = models.ForeignKey(
		ExerciseSession,
		on_delete=models.CASCADE,
		related_name="results",
	)
	exercise = models.ForeignKey(
		ExerciseTemplate,
		on_delete=models.CASCADE,
		related_name="results",
	)
	reps = models.PositiveIntegerField(default=0)
	accuracy = models.FloatField(default=0.0)
	duration = models.FloatField(default=0.0)
	order = models.PositiveIntegerField(default=1)

	class Meta:
		ordering = ["order", "id"]

	def __str__(self):
		return f"Session #{self.session_id} - {self.exercise.name}"
