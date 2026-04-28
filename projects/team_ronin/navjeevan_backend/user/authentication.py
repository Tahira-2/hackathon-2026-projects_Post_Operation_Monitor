"""
Custom JWT authentication that supports both NormalUser and MedicalPersonnel.
"""

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework.exceptions import AuthenticationFailed

from .models import NormalUser, MedicalPersonnel


class DualUserJWTAuthentication(JWTAuthentication):
    """
    Extended JWT authentication that resolves users from both NormalUser
    and MedicalPersonnel tables instead of only AUTH_USER_MODEL.
    
    This allows both user types to access protected endpoints with JWT tokens.
    """

    def get_user(self, validated_token):
        """
        Attempt to find the user in both NormalUser and MedicalPersonnel tables.
        Override of parent method to handle multiple user models.
        """
        try:
            # Use 'user_id' as the claim key (standard JWT claim from SimpleJWT)
            user_id = validated_token.get('user_id')
            if not user_id:
                raise KeyError("user_id")
        except KeyError:
            raise InvalidToken("Token contained no recognizable user identification")

        user_type = validated_token.get('user_type')

        if user_type == 'medical':
            try:
                return MedicalPersonnel.objects.get(pk=user_id)
            except MedicalPersonnel.DoesNotExist:
                raise InvalidToken("Medical personnel user not found")

        if user_type == 'normal':
            try:
                return NormalUser.objects.get(pk=user_id)
            except NormalUser.DoesNotExist:
                raise InvalidToken("Normal user not found")

        # Backward compatibility for older tokens without user_type claim.
        # This fallback can be ambiguous if IDs overlap across user tables.
        # Try NormalUser first
        try:
            user = NormalUser.objects.get(pk=user_id)
            return user
        except NormalUser.DoesNotExist:
            pass

        # Try MedicalPersonnel second
        try:
            user = MedicalPersonnel.objects.get(pk=user_id)
            return user
        except MedicalPersonnel.DoesNotExist:
            raise InvalidToken("Token user not found")
