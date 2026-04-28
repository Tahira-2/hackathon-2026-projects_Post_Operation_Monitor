import logging
from rest_framework.permissions import BasePermission

logger = logging.getLogger(__name__)


class IsMedicalPersonnel(BasePermission):
    """Allow access only to authenticated active, verified medical personnel users."""

    message = 'Only medical personnel can access this endpoint.'

    def has_permission(self, request, view):
        user = request.user
        is_auth = bool(user and user.is_authenticated)
        user_type = getattr(user, 'user_type', None)
        status_val = getattr(user, 'status', None)
        is_verified = bool(getattr(user, 'is_verified', False))
        
        logger.debug(
            f"IsMedicalPersonnel check: user={user}, "
            f"is_authenticated={is_auth}, user_type={user_type}, "
            f"status={status_val}, is_verified={is_verified}"
        )
        
        result = (
            is_auth
            and user_type == 'medical'
            and status_val == 'active'
            and is_verified
        )
        
        if not result:
            logger.warning(
                f"Permission denied for user {user}: "
                f"is_auth={is_auth}, user_type={user_type}, "
                f"status={status_val}, is_verified={is_verified}"
            )
        
        return result


class IsNormalUser(BasePermission):
    """Allow access only to authenticated normal users."""

    message = 'Only normal users can access this endpoint.'

    def has_permission(self, request, view):
        user = request.user
        is_auth = bool(user and user.is_authenticated)
        user_type = getattr(user, 'user_type', None)
        is_verified = bool(getattr(user, 'is_verified', False))
        
        logger.debug(
            f"IsNormalUser check: user={user}, "
            f"is_authenticated={is_auth}, user_type={user_type}, "
            f"is_verified={is_verified}"
        )
        
        result = (
            is_auth
            and user_type == 'normal'
            and is_verified
        )
        
        if not result:
            logger.warning(
                f"Permission denied for user {user}: "
                f"is_auth={is_auth}, user_type={user_type}, is_verified={is_verified}"
            )
        
        return result
