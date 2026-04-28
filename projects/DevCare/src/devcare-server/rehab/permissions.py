from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied

class IsDoctor(permissions.BasePermission):
    """
    Allows access only to users with the 'doctor' role.
    """
    message = "Only doctor users can access this endpoint."

    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            getattr(request.user, 'role', None) == 'doctor'
        )

class IsAssignedDoctorOrPatient(permissions.BasePermission):
    """
    Allows access only to the assigned doctor or patient.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
            
        if request.user.role == 'doctor':
            if obj.doctor != request.user:
                raise PermissionDenied("You can only view plans you created.")
            return True
            
        if request.user.role == 'patient':
            if obj.patient != request.user:
                raise PermissionDenied("You can only view plans assigned to you.")
            return True
            
        return False

class IsSessionPatient(permissions.BasePermission):
    """
    Allows access only to the patient who owns the session.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
            
        if request.user.role != 'patient':
            raise PermissionDenied("Only patient users can complete rehab sessions.")
            
        if obj.patient != request.user:
            raise PermissionDenied("You can only complete your own sessions.")
            
        return True
