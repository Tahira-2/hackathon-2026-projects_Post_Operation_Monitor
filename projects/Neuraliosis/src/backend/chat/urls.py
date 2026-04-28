from django.urls import path

from .views import ChatMessageView

app_name = "chat"

urlpatterns = [
    path("message/", ChatMessageView.as_view(), name="chat_message"),
]