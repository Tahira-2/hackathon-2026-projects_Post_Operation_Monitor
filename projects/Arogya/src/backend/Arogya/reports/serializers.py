import os

from rest_framework import serializers

from .models import DischargeReport


class DischargeReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = DischargeReport
        fields = [
            "id",
            "patient",
            "file",
            "file_type",
            "uploaded_at",
            "extracted_text",
            "status",
        ]
        read_only_fields = ["id", "patient", "uploaded_at"]

    def validate_file(self, value):
        extension = os.path.splitext(value.name)[1].lower()
        allowed_extensions = {".pdf", ".png", ".jpg", ".jpeg", ".webp"}
        if extension not in allowed_extensions:
            raise serializers.ValidationError("Only PDF or image files are allowed.")
        return value

    def validate(self, attrs):
        upload = attrs.get("file")
        provided_type = attrs.get("file_type")

        if upload:
            extension = os.path.splitext(upload.name)[1].lower()
            inferred_type = "pdf" if extension == ".pdf" else "image"

            if provided_type and provided_type != inferred_type:
                raise serializers.ValidationError(
                    {"file_type": "file_type does not match the uploaded file."}
                )
            attrs["file_type"] = inferred_type

        return attrs
