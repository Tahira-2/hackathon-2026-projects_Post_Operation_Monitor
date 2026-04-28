"""
Management command to import district-level vaccination data from the Excel file.

Usage:
    python manage.py import_vaccination_data --file ds.xlsx --year 2024

The command is idempotent — re-running it with the same year will update
existing records rather than creating duplicates (uses update_or_create).
"""

import argparse
import pandas as pd
from django.core.management.base import BaseCommand, CommandError
from visualisation.models import VaccinationRecord, District


COLUMN_MAP = {
    "BCG":     "bcg",
    "DPT_1":   "dpt_1",
    "DPT_2":   "dpt_2",
    "DPT_3":   "dpt_3",
    "DPT_1B":  "dpt_1b",
    "DPT5_2B": "dpt5_2b",
    "PENTA_1": "penta_1",
    "PENTA_2": "penta_2",
    "PENTA_3": "penta_3",
    "OPV_0":   "opv_0",
    "OPV_1":   "opv_1",
    "OPV_2":   "opv_2",
    "OPV_3":   "opv_3",
    "OPV_B":   "opv_b",
    "HEP_B0":  "hep_b0",
    "HEP_B1":  "hep_b1",
    "HEP_B2":  "hep_b2",
    "HEP_B3":  "hep_b3",
    "MEAS_1":  "meas_1",
    "MEAS_2":  "meas_2",
    "MMR_V":   "mmr_v",
    "JE_1":    "je_1",
    "JE_16M":  "je_16m",
    "TT_10":   "tt_10",
    "TT_16":   "tt_16",
}


class Command(BaseCommand):
    help = "Import district vaccination data from Excel into the database."

    def add_arguments(self, parser):
        parser.add_argument("--file", required=True, help="Path to the .xlsx file")
        parser.add_argument("--year", required=True, type=int, help="Year the data represents (e.g. 2024)")

    def handle(self, *args, **options):
        filepath = options["file"]
        year = options["year"]

        self.stdout.write(f"Reading {filepath} …")

        try:
            # The xlsx has a metadata row before the actual header
            df = pd.read_excel(filepath, header=1)
            df.columns = df.iloc[0]
            df = df.iloc[1:].reset_index(drop=True)
        except Exception as e:
            raise CommandError(f"Could not read Excel file: {e}")

        # Convert all vaccine columns to numeric
        for col in df.columns[3:]:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0).astype(int)

        created_count = 0
        updated_count = 0
        skipped_count = 0

        for _, row in df.iterrows():
            district_name = str(row.get("DISTRICT", "")).strip()
            if not district_name or district_name == "nan":
                skipped_count += 1
                continue

            # Upsert District
            district, _ = District.objects.update_or_create(
                name=district_name,
                defaults={
                    "province": str(row.get("STATE", "")).strip(),
                    "imr_classification": str(row.get("IMR", "MEDIUM")).strip(),
                    "population": int(row.get("POPULATION", 0)),
                },
            )

            # Build vaccine fields dict
            vaccine_fields = {}
            for xlsx_col, model_field in COLUMN_MAP.items():
                if xlsx_col in df.columns:
                    vaccine_fields[model_field] = int(row.get(xlsx_col, 0))

            # Upsert VaccinationRecord
            _, created = VaccinationRecord.objects.update_or_create(
                district=district,
                year=year,
                defaults=vaccine_fields,
            )

            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Done. Created: {created_count} | Updated: {updated_count} | Skipped: {skipped_count}"
            )
        )
