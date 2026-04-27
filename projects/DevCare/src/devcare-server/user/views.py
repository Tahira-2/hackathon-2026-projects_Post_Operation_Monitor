from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from django.contrib.auth import get_user_model
from user.models import UserProfile
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer, RoleTokenObtainPairSerializer, UserProfileSerializer


class RegisterView(APIView):
	permission_classes = [AllowAny]

	def post(self, request):
		serializer = RegisterSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		user = serializer.save()

		refresh = RefreshToken.for_user(user)
		return Response(
			{
				'message': 'Registration successful.',
				'user': {
					'id': user.id,
					'username': user.username,
					'email': user.email,
					'role': user.profile.role,
				},
				'refresh': str(refresh),
				'access': str(refresh.access_token),
			},
			status=status.HTTP_201_CREATED,
		)


class LoginView(TokenObtainPairView):
	permission_classes = [AllowAny]
	serializer_class = RoleTokenObtainPairSerializer


class PatientListView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request):
		User = get_user_model()
		patients = User.objects.filter(profile__role=UserProfile.ROLE_PATIENT)
		data = [{"id": p.id, "username": p.username} for p in patients]
		return Response(data)


class ProfileView(APIView):
	permission_classes = [IsAuthenticated]
	parser_classes = [MultiPartParser, FormParser, JSONParser]

	def get_object(self, user):
		profile, _ = UserProfile.objects.get_or_create(
			user=user,
			defaults={'role': UserProfile.ROLE_PATIENT},
		)
		return profile

	def get(self, request):
		profile = self.get_object(request.user)
		serializer = UserProfileSerializer(profile, context={'request': request})
		return Response(serializer.data)

	def patch(self, request):
		profile = self.get_object(request.user)
		serializer = UserProfileSerializer(
			profile,
			data=request.data,
			partial=True,
			context={'request': request},
		)
		serializer.is_valid(raise_exception=True)
		serializer.save()
		return Response(serializer.data)

	def put(self, request):
		return self.patch(request)
