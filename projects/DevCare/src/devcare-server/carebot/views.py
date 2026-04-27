from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

from user.models import UserProfile
from .ai_service import generate_rehab_plan, generate_chatbot_response

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
