from decimal import Decimal

from django.db import transaction
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema

from hackathon_project.utils import ApiResponseAPIView, api_response
from medicines.models import Medicine
from .models import Order, OrderItem
from .serializers import OrderSerializer, PlaceOrderSerializer


def _collect_error_messages(errors):
    if isinstance(errors, dict):
        messages = []
        for value in errors.values():
            messages.extend(_collect_error_messages(value))
        return messages
    if isinstance(errors, list):
        messages = []
        for item in errors:
            messages.extend(_collect_error_messages(item))
        return messages
    return [str(errors)]


class PlaceOrderView(ApiResponseAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PlaceOrderSerializer

    @extend_schema(tags=["Orders"], request=PlaceOrderSerializer, responses={status.HTTP_201_CREATED: OpenApiTypes.OBJECT})
    def post(self, request):
        serializer = PlaceOrderSerializer(data=request.data)
        if not serializer.is_valid():
            return api_response(
                result=None,
                is_success=False,
                status_code=status.HTTP_400_BAD_REQUEST,
                error_message=_collect_error_messages(serializer.errors),
            )

        items_data = serializer.validated_data["items"]

        try:
            with transaction.atomic():
                total = Decimal("0.00")
                order_items = []

                for item in items_data:
                    try:
                        medicine = Medicine.objects.select_for_update().get(id=item["medicine_id"])
                    except Medicine.DoesNotExist:
                        return api_response(
                            result=None,
                            is_success=False,
                            status_code=status.HTTP_400_BAD_REQUEST,
                            error_message=[f"Medicine with ID {item['medicine_id']} not found."],
                        )

                    if medicine.stock < item["quantity"]:
                        return api_response(
                            result=None,
                            is_success=False,
                            status_code=status.HTTP_400_BAD_REQUEST,
                            error_message=[f"Insufficient stock for {medicine.name}."],
                        )

                    line_total = medicine.price * item["quantity"]
                    total += line_total

                    medicine.stock -= item["quantity"]
                    medicine.save(update_fields=["stock"])

                    order_items.append(
                        OrderItem(medicine=medicine, quantity=item["quantity"], price=line_total)
                    )

                order = Order.objects.create(user=request.user, total=total, status=Order.Status.CONFIRMED)
                for oi in order_items:
                    oi.order = order
                OrderItem.objects.bulk_create(order_items)

            return api_response(
                result=OrderSerializer(order).data,
                is_success=True,
                status_code=status.HTTP_201_CREATED,
                error_message=[],
            )
        except Exception:
            return api_response(
                result=None,
                is_success=False,
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                error_message=["An error occurred while placing the order."],
            )


class MyOrdersView(ApiResponseAPIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(tags=["Orders"], responses={status.HTTP_200_OK: OpenApiTypes.OBJECT})
    def get(self, request):
        orders = Order.objects.filter(user=request.user).prefetch_related("items__medicine")
        serializer = OrderSerializer(orders, many=True)
        return api_response(
            result=serializer.data,
            is_success=True,
            status_code=status.HTTP_200_OK,
            error_message=[],
        )


class OrderDetailView(ApiResponseAPIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=["Orders"],
        parameters=[OpenApiParameter(name="id", type=OpenApiTypes.INT, location=OpenApiParameter.PATH)],
        responses={status.HTTP_200_OK: OpenApiTypes.OBJECT},
    )
    def get(self, request, id):
        try:
            order = Order.objects.prefetch_related("items__medicine").get(id=id, user=request.user)
        except Order.DoesNotExist:
            return api_response(
                result=None,
                is_success=False,
                status_code=status.HTTP_404_NOT_FOUND,
                error_message=["Order not found."],
            )

        return api_response(
            result=OrderSerializer(order).data,
            is_success=True,
            status_code=status.HTTP_200_OK,
            error_message=[],
        )


class OrderCollectionView(PlaceOrderView, MyOrdersView):
    """POST = place order, GET = my orders."""
    pass
