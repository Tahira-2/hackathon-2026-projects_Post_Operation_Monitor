from rest_framework import serializers
from .models import Order, OrderItem
from medicines.serializers import MedicineSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    medicine_detail = MedicineSerializer(source="medicine", read_only=True)

    class Meta:
        model = OrderItem
        fields = ("id", "medicine", "medicine_detail", "quantity", "price")
        read_only_fields = ("id", "price")


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ("id", "user", "status", "total", "items", "created_at")
        read_only_fields = ("id", "user", "total", "created_at")


class PlaceOrderItemSerializer(serializers.Serializer):
    medicine_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class PlaceOrderSerializer(serializers.Serializer):
    items = PlaceOrderItemSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Order must have at least one item.")
        return value
