from rest_framework import status
from rest_framework.permissions import AllowAny
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema

from hackathon_project.utils import ApiResponseAPIView, api_response
from .models import Medicine
from .serializers import MedicineSerializer


class ListMedicinesView(ApiResponseAPIView):
    permission_classes = [AllowAny]

    @extend_schema(
        tags=["Medicines"],
        parameters=[
            OpenApiParameter(name="search", type=OpenApiTypes.STR, required=False),
            OpenApiParameter(name="category", type=OpenApiTypes.STR, required=False),
        ],
        responses={status.HTTP_200_OK: OpenApiTypes.OBJECT},
    )
    def get(self, request):
        qs = Medicine.objects.all()

        search = request.query_params.get("search")
        if search:
            qs = qs.filter(name__icontains=search)

        category = request.query_params.get("category")
        if category:
            qs = qs.filter(category__iexact=category)

        serializer = MedicineSerializer(qs, many=True, context={"request": request})
        return api_response(
            result=serializer.data,
            is_success=True,
            status_code=status.HTTP_200_OK,
            error_message=[],
        )


class MedicineDetailView(ApiResponseAPIView):
    permission_classes = [AllowAny]

    @extend_schema(
        tags=["Medicines"],
        parameters=[
            OpenApiParameter(name="id", type=OpenApiTypes.INT, location=OpenApiParameter.PATH),
        ],
        responses={status.HTTP_200_OK: OpenApiTypes.OBJECT},
    )
    def get(self, request, id):
        try:
            med = Medicine.objects.get(id=id)
        except Medicine.DoesNotExist:
            return api_response(
                result=None,
                is_success=False,
                status_code=status.HTTP_404_NOT_FOUND,
                error_message=["Medicine not found."],
            )

        serializer = MedicineSerializer(med, context={"request": request})
        return api_response(
            result=serializer.data,
            is_success=True,
            status_code=status.HTTP_200_OK,
            error_message=[],
        )
