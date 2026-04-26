from typing import Any

from rest_framework.exceptions import NotAuthenticated, PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView


def api_response(
    result: Any = None,
    is_success: bool = True,
    status_code: int = 200,
    error_message: list[str] | str | None = None,
) -> Response:
    if error_message is None:
        errors: list[str] = []
    elif isinstance(error_message, str):
        errors = [error_message]
    else:
        errors = [str(message) for message in error_message]

    return Response(
        {
            "result": result,
            "isSuccess": is_success,
            "statusCode": status_code,
            "errorMessage": errors,
        },
        status=status_code,
    )


class ApiResponseAPIView(APIView):
    """APIView that preserves the project response envelope for auth errors."""

    def dispatch(self, request, *args, **kwargs):
        try:
            return super().dispatch(request, *args, **kwargs)
        except Exception:
            return api_response(
                result=None,
                is_success=False,
                status_code=500,
                error_message=["An unexpected server error occurred."],
            )

    def handle_exception(self, exc):
        if isinstance(exc, NotAuthenticated):
            return api_response(
                result=None,
                is_success=False,
                status_code=401,
                error_message=["Authentication credentials were not provided."],
            )

        if isinstance(exc, PermissionDenied):
            return api_response(
                result=None,
                is_success=False,
                status_code=403,
                error_message=["You do not have permission to perform this action."],
            )

        return super().handle_exception(exc)