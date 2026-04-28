from django.urls import path
from .views import RehabPlanGenerateView, CareBotAIView

urlpatterns = [
    path("generate-plan/", RehabPlanGenerateView.as_view(), name="ai-generate-plan"),
    path("chatbot/", CareBotAIView.as_view(), name="ai-chatbot"),
]
