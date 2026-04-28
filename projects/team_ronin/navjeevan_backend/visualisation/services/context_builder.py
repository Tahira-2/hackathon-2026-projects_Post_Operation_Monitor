from django.db.models import Avg

from visualisation.models import VaccinationRecord


def _safe_pct(numerator, denominator):
    base = denominator or 1
    return round((numerator or 0) / base * 100, 1)


def build_district_context(district_id, year):
    record = VaccinationRecord.objects.select_related("district").get(
        district__id=district_id,
        year=year,
    )
    district = record.district

    national = VaccinationRecord.objects.filter(year=year).aggregate(
        nat_bcg=Avg("bcg"),
        nat_dpt3=Avg("dpt_3"),
        nat_penta3=Avg("penta_3"),
        nat_opv3=Avg("opv_3"),
        nat_hepb3=Avg("hep_b3"),
        nat_meas1=Avg("meas_1"),
        nat_mmr=Avg("mmr_v"),
    )
    national_coverage = _safe_pct(national.get("nat_dpt3"), national.get("nat_bcg"))

    province = VaccinationRecord.objects.filter(
        year=year,
        district__province=district.province,
    )
    province_avg = province.aggregate(prov_bcg=Avg("bcg"), prov_dpt3=Avg("dpt_3"))
    province_coverage = _safe_pct(province_avg.get("prov_dpt3"), province_avg.get("prov_bcg"))

    ranked = sorted(
        province.select_related("district"),
        key=lambda value: (value.dpt_3 or 0) / (value.bcg or 1),
        reverse=True,
    )
    rank = next(
        (
            index + 1
            for index, value in enumerate(ranked)
            if value.district_id == district_id
        ),
        None,
    )

    history = (
        VaccinationRecord.objects.filter(district__id=district_id)
        .order_by("year")
    )
    trend = " -> ".join(
        f"{item.year}: {_safe_pct(item.dpt_3, item.bcg)}%"
        for item in history
    ) or "Single year only"

    comparisons = [
        ("DPT-3", record.dpt_3, national.get("nat_dpt3")),
        ("Penta-3", record.penta_3, national.get("nat_penta3")),
        ("OPV-3", record.opv_3, national.get("nat_opv3")),
        ("HepB-3", record.hep_b3, national.get("nat_hepb3")),
        ("Measles-1", record.meas_1, national.get("nat_meas1")),
        ("MMR", record.mmr_v, national.get("nat_mmr")),
    ]
    lines = []
    for label, district_count, national_count in comparisons:
        district_pct = _safe_pct(district_count, record.bcg)
        national_pct = _safe_pct(national_count, national.get("nat_bcg"))
        gap = round(district_pct - national_pct, 1)
        if gap <= -15:
            flag = " <- critical"
        elif gap < 0:
            flag = " <- below average"
        else:
            flag = ""
        lines.append(
            f"{label}: {district_pct}% (national: {national_pct}%, gap: {gap:+.1f}pp){flag}"
        )

    return f"""
=== DISTRICT DATA ({year}) ===
District: {district.name}
Province: {district.province}
IMR Classification: {district.imr_classification}
Population: {district.population}
BCG baseline: {record.bcg}
DPT-3 doses: {record.dpt_3}
DPT-3 Coverage: {record.coverage_pct}%
Province average: {province_coverage}%
National average: {national_coverage}%
Province rank: {rank or 'N/A'} of {len(ranked)} districts

=== VACCINE BREAKDOWN VS NATIONAL ===
{chr(10).join(lines)}

=== YEAR-OVER-YEAR TREND ===
{trend}

=== NEPAL NIP SCHEDULE ===
Birth: BCG, OPV-0, Hep-B birth dose
6 weeks: Penta-1 (DPT-HepB-Hib), OPV-1, PCV-1
10 weeks: Penta-2, OPV-2, PCV-2
14 weeks: Penta-3, OPV-3, PCV-3, IPV
9 months: MR-1, JE-1
15 months: MR-2, JE-2
5 years: DPT booster, OPV booster
10 years: TT
16 years: TT booster
""".strip()
