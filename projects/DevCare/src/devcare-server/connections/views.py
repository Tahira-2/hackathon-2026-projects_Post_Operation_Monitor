from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from user.models import UserProfile
from .models import DoctorPatientLink, DoctorPatientRelation
from .serializers import CreateJoinLinkSerializer
from .utils import generate_secure_token, generate_qr_code_base64


class CreateJoinLinkView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile = getattr(request.user, "profile", None)
        role = getattr(profile, "role", None)
        if role != UserProfile.ROLE_DOCTOR:
            return Response(
                {"detail": "Only doctors can create join links."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = CreateJoinLinkSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        slug = serializer.validated_data.get("slug", "").strip()
        expires_at = serializer.validated_data.get("expires_at")
        
        # Generate secure random token
        raw_token = generate_secure_token(12)
        token = f"{slug}-{raw_token}" if slug else raw_token
        
        link = DoctorPatientLink.objects.create(
            doctor=request.user,
            slug=slug,
            token=token,
            expires_at=expires_at
        )
        
        # Frontend domain simulation for hackathon demo
        frontend_domain = "http://localhost:5173"
        full_url = f"{frontend_domain}/join/{token}"
        
        qr_code_base64 = generate_qr_code_base64(full_url)
        
        return Response({
            "link": full_url,
            "token": token,
            "qr_code": f"data:image/png;base64,{qr_code_base64}"
        }, status=status.HTTP_201_CREATED)


class JoinLinkView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, token):
        profile = getattr(request.user, "profile", None)
        role = getattr(profile, "role", None)
        if role != UserProfile.ROLE_PATIENT:
            return Response(
                {"detail": "Only patients can join via links."},
                status=status.HTTP_403_FORBIDDEN,
            )

        link = get_object_or_404(DoctorPatientLink, token=token)
        
        if not link.is_active:
            return Response({"detail": "This link is no longer active."}, status=status.HTTP_400_BAD_REQUEST)
            
        if link.expires_at and link.expires_at < timezone.now():
            return Response({"detail": "This link has expired."}, status=status.HTTP_400_BAD_REQUEST)
            
        # Create relation if it doesn't exist
        relation, created = DoctorPatientRelation.objects.get_or_create(
            doctor=link.doctor,
            patient=request.user
        )
        
        # Get doctor info
        doctor_profile = getattr(link.doctor, "profile", None)
        doctor_name = f"Dr. {link.doctor.first_name} {link.doctor.last_name}".strip()
        if doctor_name == "Dr.":
            doctor_name = f"Dr. {link.doctor.username}"

        response_data = {
            "detail": "Successfully connected with the doctor.",
            "doctor": {
                "id": link.doctor.id,
                "name": doctor_name,
                "username": link.doctor.username,
            }
        }
        
        if created:
            return Response(response_data, status=status.HTTP_200_OK)
        else:
            response_data["detail"] = "You are already connected with this doctor."
            return Response(response_data, status=status.HTTP_200_OK)


class ConnectedPatientsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = getattr(request.user, "profile", None)
        role = getattr(profile, "role", None)
        if role != UserProfile.ROLE_DOCTOR:
            return Response(
                {"detail": "Only doctors can view their connected patients."},
                status=status.HTTP_403_FORBIDDEN,
            )

        relations = DoctorPatientRelation.objects.filter(doctor=request.user).select_related("patient")
        patients_data = []
        for rel in relations:
            profile_patient = getattr(rel.patient, 'profile', None)
            avatar_url = None
            if profile_patient and profile_patient.avatar:
                avatar_url = request.build_absolute_uri(profile_patient.avatar.url)

            patients_data.append({
                "id": rel.patient.id,
                "username": rel.patient.username,
                "name": f"{rel.patient.first_name} {rel.patient.last_name}".strip() or rel.patient.username,
                "email": rel.patient.email,
                "connected_at": rel.created_at,
                "avatar_url": avatar_url,
            })

        return Response(patients_data, status=status.HTTP_200_OK)
