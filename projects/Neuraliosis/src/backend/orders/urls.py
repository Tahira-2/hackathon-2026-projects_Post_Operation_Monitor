from django.urls import path
from .views import OrderCollectionView, OrderDetailView

app_name = "orders"

urlpatterns = [
    path("", OrderCollectionView.as_view(), name="orders_root"),
    path("<int:id>/", OrderDetailView.as_view(), name="order_detail"),
]
