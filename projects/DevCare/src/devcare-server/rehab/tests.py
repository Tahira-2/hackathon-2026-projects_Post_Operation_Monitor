from django.test import TestCase

# Create your tests here.

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from rehab.models import Exercise, RehabPlan, ExerciseSession, SessionResult, PlanExercise

User = get_user_model()

class RehabAPITests(APITestCase):
    def setUp(self):
        # Create a doctor
        self.doctor = User.objects.create_user(
            email='doctor@test.com',
            username='doctor',
            password='password123',
            role='doctor'
        )
        # Create a patient
        self.patient = User.objects.create_user(
            email='patient@test.com',
            username='patient',
            password='password123',
            role='patient'
        )
        # Create an exercise template
        self.exercise = Exercise.objects.create(
            name='Test Exercise',
            description='Test Description',
            target_joint='elbow',
            instructions='Test Instructions',
            min_angle=0.0,
            max_angle=180.0
        )
        
        # Authentication URLs
        self.login_url = reverse('login')
        self.exercises_url = reverse('exercise-list')
        self.plans_url = reverse('rehab-plan-create')

    def authenticate(self, email, password):
        response = self.client.post(self.login_url, {
            'email': email,
            'password': password
        })
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {response.data["access"]}')

    def test_exercise_list_authenticated(self):
        """Ensure any authenticated user can list exercises."""
        self.authenticate('patient@test.com', 'password123')
        response = self.client.get(self.exercises_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_rehab_plan_as_doctor(self):
        """Ensure doctors can create rehab plans."""
        self.authenticate('doctor@test.com', 'password123')
        data = {
            "patient_id": self.patient.id,
            "name": "Test Plan",
            "exercises": [{"exercise_id": self.exercise.id, "order": 1, "target_reps": 10}]
        }
        response = self.client.post(self.plans_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_get_patient_history_as_doctor(self):
        """Doctor can view patient session history."""
        plan = RehabPlan.objects.create(doctor=self.doctor, patient=self.patient, name="Test Plan")
        session = ExerciseSession.objects.create(patient=self.patient, plan=plan)
        url = reverse('patient-session-history', kwargs={'patient_id': self.patient.id})
        
        self.authenticate('doctor@test.com', 'password123')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
