from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class District(models.Model):
    IMR_CHOICES = [
        ("LOW", "Low"),
        ("MEDIUM", "Medium"),
        ("HIGH", "High"),
    ]

    name = models.CharField(max_length=100, unique=True)
    province = models.CharField(max_length=100)
    imr_classification = models.CharField(max_length=10, choices=IMR_CHOICES)
    population = models.IntegerField(validators=[MinValueValidator(0)])

    class Meta:
        ordering = ["province", "name"]

    def __str__(self):
        return f"{self.name} ({self.province})"


class VaccinationRecord(models.Model):
    district = models.ForeignKey(
        District, on_delete=models.CASCADE, related_name="vaccination_records"
    )
    year = models.IntegerField(
        validators=[MinValueValidator(2000), MaxValueValidator(2100)]
    )

    # BCG
    bcg = models.IntegerField(default=0, validators=[MinValueValidator(0)])

    # DPT series
    dpt_1 = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    dpt_2 = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    dpt_3 = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    dpt_1b = models.IntegerField(default=0, validators=[MinValueValidator(0)])  # booster
    dpt5_2b = models.IntegerField(default=0, validators=[MinValueValidator(0)])

    # Pentavalent (DPT-HepB-Hib)
    penta_1 = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    penta_2 = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    penta_3 = models.IntegerField(default=0, validators=[MinValueValidator(0)])

    # OPV (Oral Polio Vaccine)
    opv_0 = models.IntegerField(default=0, validators=[MinValueValidator(0)])  # birth dose
    opv_1 = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    opv_2 = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    opv_3 = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    opv_b = models.IntegerField(default=0, validators=[MinValueValidator(0)])  # booster

    # Hepatitis B
    hep_b0 = models.IntegerField(default=0, validators=[MinValueValidator(0)])  # birth dose
    hep_b1 = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    hep_b2 = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    hep_b3 = models.IntegerField(default=0, validators=[MinValueValidator(0)])

    # Measles / MMR
    meas_1 = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    meas_2 = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    mmr_v = models.IntegerField(default=0, validators=[MinValueValidator(0)])

    # Japanese Encephalitis
    je_1 = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    je_16m = models.IntegerField(default=0, validators=[MinValueValidator(0)])

    # Tetanus Toxoid (school-age)
    tt_10 = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    tt_16 = models.IntegerField(default=0, validators=[MinValueValidator(0)])

    class Meta:
        unique_together = [("district", "year")]
        ordering = ["-year", "district__name"]

    def __str__(self):
        return f"{self.district.name} — {self.year}"

    @property
    def coverage_pct(self):
        """DPT-3 / BCG * 100 — standard WHO proxy for full immunization coverage."""
        if not self.bcg:
            return 0.0
        return round(self.dpt_3 / self.bcg * 100, 1)

    @property
    def vaccine_breakdown(self):
        """Per-vaccine coverage relative to BCG baseline."""
        base = self.bcg or 1
        return {
            "BCG": 100.0,
            "DPT-3": round(self.dpt_3 / base * 100, 1),
            "Penta-3": round(self.penta_3 / base * 100, 1),
            "OPV-3": round(self.opv_3 / base * 100, 1),
            "HepB-3": round(self.hep_b3 / base * 100, 1),
            "Measles-1": round(self.meas_1 / base * 100, 1),
            "MMR": round(self.mmr_v / base * 100, 1),
        }


class IndividualVaccinationRecord(models.Model):
    DOSE_STATUS = [
        ("completed", "Completed"),
        ("scheduled", "Scheduled"),
        ("missed", "Missed"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="vaccination_records",
    )
    vaccine_name = models.CharField(max_length=100)
    dose_number = models.IntegerField(
        default=1, validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    date_administered = models.DateField(null=True, blank=True)
    scheduled_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=DOSE_STATUS, default="scheduled")
    district = models.ForeignKey(
        District, on_delete=models.SET_NULL, null=True, blank=True
    )
    administered_by = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["scheduled_date", "vaccine_name"]
        unique_together = [("user", "vaccine_name", "dose_number")]

    def __str__(self):
        return f"{self.user.username} — {self.vaccine_name} dose {self.dose_number}"