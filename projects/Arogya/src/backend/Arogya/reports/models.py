from django.conf import settings
from django.db import models


class DischargeReport(models.Model):
    class FileType(models.TextChoices):
        PDF = "pdf", "PDF"
        IMAGE = "image", "Image"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PROCESSED = "processed", "Processed"

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="discharge_reports",
    )
    file = models.FileField(upload_to="reports/")
    file_type = models.CharField(max_length=10, choices=FileType.choices)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    extracted_text = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self):
        return f"Report {self.id} - {self.patient}"
