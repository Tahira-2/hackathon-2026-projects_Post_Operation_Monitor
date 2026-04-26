"""
Generate sample medical bill PDFs for demo/testing purposes.
Uses PyMuPDF (fitz) to create realistic-looking medical bills.
"""

import fitz  # PyMuPDF
import os

def create_bill_pdf(output_path: str, hospital_name: str, hospital_addr: str,
                    patient_name: str, account_no: str, dos: str, stmt_date: str,
                    provider: str, insurance: str,
                    items: list, subtotal: str, ins_adj: str, total: str):
    doc = fitz.open()
    page = doc.new_page(width=612, height=792)  # Letter size

    # Colors
    header_color = (0.1, 0.3, 0.6)
    black = (0, 0, 0)
    gray = (0.4, 0.4, 0.4)
    light_gray = (0.85, 0.85, 0.85)

    # Header
    page.insert_text((50, 50), hospital_name, fontsize=18, fontname="helv", color=header_color)
    page.insert_text((50, 72), "Department of Patient Billing", fontsize=10, fontname="helv", color=gray)
    page.insert_text((50, 86), hospital_addr, fontsize=9, fontname="helv", color=gray)
    page.insert_text((50, 100), "Phone: (217) 555-0142 | Fax: (217) 555-0143", fontsize=9, fontname="helv", color=gray)

    # Line
    page.draw_line((50, 115), (562, 115), color=header_color, width=2)

    # Title
    page.insert_text((200, 145), "PATIENT BILLING STATEMENT", fontsize=14, fontname="helv", color=header_color)

    # Patient info
    y = 175
    page.insert_text((50, y), f"Patient Name: {patient_name}", fontsize=10, fontname="helv", color=black)
    page.insert_text((350, y), f"Account #: {account_no}", fontsize=10, fontname="helv", color=black)
    y += 18
    page.insert_text((50, y), f"Date of Service: {dos}", fontsize=10, fontname="helv", color=black)
    page.insert_text((350, y), f"Statement Date: {stmt_date}", fontsize=10, fontname="helv", color=black)
    y += 18
    page.insert_text((50, y), f"Provider: {provider}", fontsize=10, fontname="helv", color=black)
    page.insert_text((350, y), f"Insurance: {insurance}", fontsize=10, fontname="helv", color=black)

    # Line
    y += 25
    page.draw_line((50, y), (562, y), color=gray, width=0.5)

    # Table header
    y += 20
    page.insert_text((50, y), "Description", fontsize=9, fontname="helv", color=header_color)
    page.insert_text((265, y), "CPT Code", fontsize=9, fontname="helv", color=header_color)
    page.insert_text((345, y), "Qty", fontsize=9, fontname="helv", color=header_color)
    page.insert_text((390, y), "Unit Price", fontsize=9, fontname="helv", color=header_color)
    page.insert_text((500, y), "Amount", fontsize=9, fontname="helv", color=header_color)
    y += 5
    page.draw_line((50, y), (562, y), color=header_color, width=1)

    # Alternating row shading
    for idx, (desc, cpt, qty, unit, amount) in enumerate(items):
        y += 18
        if idx % 2 == 0:
            page.draw_rect(fitz.Rect(48, y - 12, 564, y + 5), color=None, fill=light_gray)
        page.insert_text((50, y), desc, fontsize=9, fontname="helv", color=black)
        page.insert_text((270, y), cpt, fontsize=9, fontname="helv", color=gray)
        page.insert_text((350, y), qty, fontsize=9, fontname="helv", color=black)
        page.insert_text((390, y), f"${unit}", fontsize=9, fontname="helv", color=black)
        page.insert_text((500, y), f"${amount}", fontsize=9, fontname="helv", color=black)

    # Subtotal section
    y += 30
    page.draw_line((380, y), (562, y), color=gray, width=0.5)
    y += 18
    page.insert_text((380, y), "Subtotal:", fontsize=10, fontname="helv", color=black)
    page.insert_text((500, y), f"${subtotal}", fontsize=10, fontname="helv", color=black)
    y += 18
    page.insert_text((380, y), "Insurance Adj:", fontsize=10, fontname="helv", color=gray)
    page.insert_text((500, y), f"-${ins_adj}", fontsize=10, fontname="helv", color=gray)
    y += 5
    page.draw_line((380, y), (562, y), color=header_color, width=1.5)
    y += 18
    page.insert_text((380, y), "Total Due:", fontsize=12, fontname="helv", color=header_color)
    page.insert_text((495, y), f"${total}", fontsize=12, fontname="helv", color=header_color)

    # Footer
    y += 50
    page.draw_line((50, y), (562, y), color=gray, width=0.5)
    y += 15
    page.insert_text((50, y), "Payment is due within 30 days. For questions, call Patient Billing at (217) 555-0142.", fontsize=8, fontname="helv", color=gray)
    y += 12
    page.insert_text((50, y), "This is a computer-generated statement. If you have already made payment, please disregard.", fontsize=7, fontname="helv", color=gray)
    y += 12
    page.insert_text((50, y), "This statement does not constitute medical, legal, or financial advice.", fontsize=7, fontname="helv", color=gray)

    doc.save(output_path)
    doc.close()
    print(f"Created: {output_path} ({os.path.getsize(output_path)} bytes)")


def create_all_demo_bills():
    # ──────────────────────────────────────────────────────────────────
    # 1. CLEAN BILL — routine checkup, 12 items, all fairly priced
    #    Prices closely match CMS Medicare benchmarks
    # ──────────────────────────────────────────────────────────────────
    clean_items = [
        ("Office Visit, Established Patient",     "99214", "1", "112.00",    "112.00"),
        ("Complete Blood Count (CBC)",             "85025", "1", "11.00",     "11.00"),
        ("Comprehensive Metabolic Panel",          "80053", "1", "14.00",     "14.00"),
        ("Lipid Panel",                            "80061", "1", "18.00",     "18.00"),
        ("Hemoglobin A1c Test",                    "83036", "1", "13.00",     "13.00"),
        ("Urinalysis, Automated",                  "81003", "1", "4.00",      "4.00"),
        ("Venipuncture (Blood Draw)",              "36415", "1", "4.00",      "4.00"),
        ("Chest X-ray, Single View",               "71045", "1", "22.00",     "22.00"),
        ("Electrocardiogram, 12-lead",             "93000", "1", "18.00",     "18.00"),
        ("Flu Vaccine Administration",             "90471", "1", "26.00",     "26.00"),
        ("Influenza Vaccine, Quadrivalent",        "90688", "1", "22.00",     "22.00"),
        ("Thyroid Stimulating Hormone (TSH)",      "84443", "1", "22.00",     "22.00"),
    ]
    create_bill_pdf(
        "demo_bill_clean.pdf",
        hospital_name="SPRINGFIELD FAMILY MEDICINE",
        hospital_addr="450 Wellness Parkway, Suite 200, Springfield, IL 62701",
        patient_name="Emily Rodriguez", account_no="SFM-2026-1187",
        dos="03/22/2026", stmt_date="04/05/2026",
        provider="Dr. Amanda Liu, MD", insurance="BlueCross BlueShield PPO",
        items=clean_items,
        subtotal="286.00", ins_adj="228.80", total="57.20"
    )

    # ──────────────────────────────────────────────────────────────────
    # 2. MIXED BILL — ER visit, 14 items
    #    Some items fairly priced, some moderately overcharged,
    #    a couple of vague line items, one clearly inflated drug price
    # ──────────────────────────────────────────────────────────────────
    mixed_items = [
        # Fair
        ("Emergency Dept Visit, Moderate",         "99283", "1", "450.00",    "450.00"),
        ("Complete Blood Count (CBC)",             "85025", "1", "12.00",     "12.00"),
        ("Basic Metabolic Panel",                  "80048", "1", "11.00",     "11.00"),
        ("Urinalysis, Automated",                  "81003", "1", "4.50",      "4.50"),
        # Moderately overcharged
        ("Chest X-ray, 2 Views",                   "71046", "1", "210.00",    "210.00"),
        ("Electrocardiogram (ECG/EKG)",            "93000", "1", "95.00",     "95.00"),
        ("CT Head without Contrast",               "70450", "1", "890.00",    "890.00"),
        # Overcharged drugs
        ("Ibuprofen 400mg Oral Tablet",            "",      "4", "28.00",     "112.00"),
        ("Ondansetron 4mg IV Injection",           "",      "2", "85.00",     "170.00"),
        # Vague / inflated
        ("IV Start Kit and Tubing Supplies",       "",      "1", "175.00",    "175.00"),
        ("Therapeutic IV Push Administration",      "96374", "2", "125.00",    "250.00"),
        ("Miscellaneous Medical Supplies",         "",      "1", "265.00",    "265.00"),
        # Fair
        ("Physician Interpretation Fee",           "",      "1", "75.00",     "75.00"),
        ("Discharge Planning Services",            "",      "1", "60.00",     "60.00"),
    ]
    create_bill_pdf(
        "demo_bill_mixed.pdf",
        hospital_name="MERCY GENERAL HOSPITAL",
        hospital_addr="1234 Medical Center Drive, Springfield, IL 62701",
        patient_name="Sarah Johnson", account_no="MGH-2026-4521",
        dos="03/15/2026", stmt_date="04/01/2026",
        provider="Dr. Michael Chen, MD", insurance="BlueCross BlueShield PPO",
        items=mixed_items,
        subtotal="2,779.50", ins_adj="620.00", total="2,159.50"
    )

    # ──────────────────────────────────────────────────────────────────
    # 3. SEVERE BILL — 3-day hospital stay, 18 items
    #    Heavy overcharges on most items, but a few moderate ones mixed in
    #    Multiple vague/unspecified fees, extreme drug markups
    # ──────────────────────────────────────────────────────────────────
    severe_items = [
        # Extreme overcharges
        ("Emergency Dept Visit, Highest Severity", "99285", "1", "3,200.00",  "3,200.00"),
        ("Room and Board, Private Room",           "",      "3", "5,800.00",  "17,400.00"),
        ("CT Abdomen/Pelvis with Contrast",        "74177", "1", "4,500.00",  "4,500.00"),
        ("MRI Brain without Contrast",             "70551", "1", "3,800.00",  "3,800.00"),
        # Moderate overcharges (not insane, but above CMS)
        ("Complete Blood Count (CBC)",             "85025", "1", "85.00",     "85.00"),
        ("Comprehensive Metabolic Panel",          "80053", "1", "125.00",    "125.00"),
        ("Chest X-ray, 2 Views",                   "71046", "1", "320.00",    "320.00"),
        ("Electrocardiogram (ECG/EKG)",            "93000", "1", "145.00",    "145.00"),
        # Extreme drug markups
        ("Acetaminophen 500mg Tablet",             "",      "6", "38.00",     "228.00"),
        ("Saline Bag 0.9% 1000mL",                "",      "4", "275.00",    "1,100.00"),
        ("Ceftriaxone 1g IV Injection",            "",      "3", "310.00",    "930.00"),
        # Vague / unspecified fees
        ("Unspecified Facility Fee",               "",      "1", "2,800.00",  "2,800.00"),
        ("General Hospital Supplies",              "",      "1", "1,450.00",  "1,450.00"),
        ("Stat Lab Processing Surcharge",          "",      "1", "480.00",    "480.00"),
        ("Patient Monitoring, Continuous",         "",      "3", "650.00",    "1,950.00"),
        # Fair items (to make it realistic, not everything is terrible)
        ("Physician Consultation, Inpatient",      "99253", "1", "150.00",    "150.00"),
        ("Discharge Coordination Services",        "",      "1", "95.00",     "95.00"),
        ("Nutritional Assessment",                 "97802", "1", "55.00",     "55.00"),
    ]
    create_bill_pdf(
        "demo_bill_severe.pdf",
        hospital_name="ST. JAMES REGIONAL MEDICAL CENTER",
        hospital_addr="800 University Boulevard, Springfield, IL 62704",
        patient_name="Robert Martinez", account_no="SJR-2026-8034",
        dos="03/08/2026", stmt_date="04/12/2026",
        provider="Dr. Karen Walsh, MD", insurance="UnitedHealth Choice Plus",
        items=severe_items,
        subtotal="38,813.00", ins_adj="6,200.00", total="32,613.00"
    )


if __name__ == "__main__":
    create_all_demo_bills()
