from rest_framework import serializers
from .models import District, VaccinationRecord, IndividualVaccinationRecord


class DistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = District
        fields = ["id", "name", "province", "imr_classification", "population"]


class VaccinationRecordSerializer(serializers.ModelSerializer):
    district_name = serializers.CharField(source="district.name", read_only=True)
    province = serializers.CharField(source="district.province", read_only=True)
    imr = serializers.CharField(source="district.imr_classification", read_only=True)
    coverage_pct = serializers.FloatField(read_only=True)
    vaccine_breakdown = serializers.DictField(read_only=True)

    class Meta:
        model = VaccinationRecord
        fields = [
            "id",
            "district",
            "district_name",
            "province",
            "imr",
            "year",
            "coverage_pct",
            "vaccine_breakdown",
            # raw counts
            "bcg",
            "dpt_1", "dpt_2", "dpt_3", "dpt_1b", "dpt5_2b",
            "penta_1", "penta_2", "penta_3",
            "opv_0", "opv_1", "opv_2", "opv_3", "opv_b",
            "hep_b0", "hep_b1", "hep_b2", "hep_b3",
            "meas_1", "meas_2", "mmr_v",
            "je_1", "je_16m",
            "tt_10", "tt_16",
        ]


class CoverageMapSerializer(serializers.ModelSerializer):
    """Lightweight serializer for the choropleth map — only what the map needs."""
    district_name = serializers.CharField(source="district.name", read_only=True)
    province = serializers.CharField(source="district.province", read_only=True)
    imr = serializers.CharField(source="district.imr_classification", read_only=True)
    population = serializers.IntegerField(source="district.population", read_only=True)
    coverage_pct = serializers.FloatField(read_only=True)

    class Meta:
        model = VaccinationRecord
        fields = ["district", "district_name", "province", "imr", "population", "year", "coverage_pct", "bcg", "dpt_3"]


class DistrictDetailSerializer(serializers.ModelSerializer):
    """Full detail for the side panel when a district is clicked."""
    district_name = serializers.CharField(source="district.name", read_only=True)
    province = serializers.CharField(source="district.province", read_only=True)
    imr = serializers.CharField(source="district.imr_classification", read_only=True)
    population = serializers.IntegerField(source="district.population", read_only=True)
    coverage_pct = serializers.FloatField(read_only=True)
    vaccine_breakdown = serializers.DictField(read_only=True)

    class Meta:
        model = VaccinationRecord
        fields = [
            "district", "district_name", "province", "imr", "population",
            "year", "coverage_pct", "vaccine_breakdown",
            "bcg", "dpt_3", "penta_3", "opv_3", "hep_b3", "meas_1", "mmr_v",
        ]


class IndividualVaccinationSerializer(serializers.ModelSerializer):
    class Meta:
        model = IndividualVaccinationRecord
        fields = [
            "id", "vaccine_name", "dose_number", "date_administered",
            "scheduled_date", "status", "district", "administered_by",
            "notes", "created_at", "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]