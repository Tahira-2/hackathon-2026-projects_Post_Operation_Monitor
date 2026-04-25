from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer, RoleTokenObtainPairSerializer


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
