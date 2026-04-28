"""
MediClaim AI — Medical NER Service
Hybrid approach: regex-based extraction (always works) + optional HF API enhancement.
"""

import re
import logging
import requests
import os
import json
from typing import List, Optional
from backend.models.bill import ExtractedEntity, ExtractedBillData, LineItem
from backend.config import get_settings

logger = logging.getLogger(__name__)

# ── Common medical terms for category classification ──
CATEGORY_KEYWORDS = {
    "Laboratory": ["blood", "cbc", "metabolic", "panel", "urinalysis", "hemoglobin",
                    "a1c", "lipid", "thyroid", "tsh", "culture", "glucose", "platelet",
                    "cholesterol", "triglyceride", "bilirubin", "creatinine", "bmp", "cmp"],
    "Radiology": ["x-ray", "xray", "ct scan", "ct ", "mri", "ultrasound", "imaging",
                   "radiograph", "fluoroscopy", "mammogram", "pet scan", "nuclear"],
    "Surgery": ["surgery", "surgical", "operation", "incision", "excision", "repair",
                "removal", "arthroplasty", "arthroscopy", "laparoscopic", "endoscopy",
                "colonoscopy", "biopsy", "appendectomy", "cholecystectomy", "replacement"],
    "Cardiology": ["ecg", "ekg", "electrocardiogram", "echocardiogram", "cardiac",
                    "heart", "stress test", "catheterization", "angiography"],
    "Emergency": ["emergency", "er ", "ed visit", "urgent", "trauma"],
    "Inpatient": ["room", "board", "hospital stay", "inpatient", "admission",
                   "discharge", "bed"],
    "Pharmacy": ["medication", "drug", "prescription", "rx", "pharmacy", "dispensing",
                  "tablet", "capsule", "injection", "infusion", "iv "],
    "Therapy": ["physical therapy", "occupational therapy", "rehabilitation",
                "therapeutic exercise", "manual therapy"],
    "Evaluation & Management": ["office visit", "consultation", "evaluation",
                                 "follow-up", "established patient", "new patient"],
    "Preventive": ["vaccine", "immunization", "screening", "preventive", "wellness"],
}

# ── Known drug names for matching ──
COMMON_DRUGS = [
    "acetaminophen", "ibuprofen", "amoxicillin", "metformin", "lisinopril",
    "atorvastatin", "omeprazole", "amlodipine", "metoprolol", "losartan",
    "gabapentin", "hydrochlorothiazide", "sertraline", "simvastatin",
    "montelukast", "escitalopram", "rosuvastatin", "bupropion", "pantoprazole",
    "furosemide", "prednisone", "tramadol", "cephalexin", "ciprofloxacin",
    "azithromycin", "albuterol", "insulin", "warfarin", "clopidogrel",
    "oxycodone", "morphine", "fentanyl", "hydrocodone", "aspirin",
    "heparin", "enoxaparin", "vancomycin", "piperacillin", "meropenem",
    "fluconazole", "dexamethasone", "methylprednisolone", "ondansetron",
    "diphenhydramine", "lorazepam", "midazolam", "propofol", "ketamine",
    "epinephrine", "norepinephrine", "dopamine", "nitroglycerin", "saline",
    "tylenol", "advil", "motrin", "lipitor", "zocor", "norvasc", "lasix"
]


def extract_entities(raw_text: str) -> ExtractedBillData:
    """Extract structured medical billing entities from raw text."""
    entities: List[ExtractedEntity] = []
    line_items: List[LineItem] = []

    # ── Extract dollar amounts ──
    amount_pattern = r'\$\s*([\d,]+\.?\d{0,2})'
    for match in re.finditer(amount_pattern, raw_text):
        value = match.group(1).replace(",", "")
        entities.append(ExtractedEntity(
            text=f"${value}", label="AMOUNT",
            confidence=0.95, start=match.start(), end=match.end()
        ))

    # ── Extract CPT codes (5-digit codes) ──
    cpt_pattern = r'\b(\d{5})\b'
    for match in re.finditer(cpt_pattern, raw_text):
        code = match.group(1)
        # Filter to plausible CPT range (00100-99499)
        code_int = int(code)
        if 100 <= code_int <= 99499:
            entities.append(ExtractedEntity(
                text=code, label="CPT",
                confidence=0.85, start=match.start(), end=match.end()
            ))

    # ── Extract drug names ──
    text_lower = raw_text.lower()
    for drug in COMMON_DRUGS:
        idx = text_lower.find(drug)
        if idx != -1:
            entities.append(ExtractedEntity(
                text=drug.title(), label="DRUG",
                confidence=0.80, start=idx, end=idx + len(drug)
            ))

    # ── Build line items from text lines ──
    line_items = _parse_line_items(raw_text)

    # ── Extract total ──
    total = _extract_total(raw_text)

    return ExtractedBillData(
        raw_text=raw_text,
        entities=entities,
        line_items=line_items,
        total_amount=total,
        patient_name=_extract_patient_name(raw_text),
        provider_name=_extract_provider_name(raw_text),
        date_of_service=_extract_date(raw_text),
    )


def _parse_line_items(text: str) -> List[LineItem]:
    """Parse individual charge lines from bill text.
    Handles two formats:
      1. Multi-line PDF tables (each field on its own line)
      2. Single-line formats (description ... $amount)
    """
    # Try multi-line table parsing first
    items = _parse_multiline_table(text)
    if items:
        return items

    # Fallback: single-line regex parsing
    return _parse_single_line(text)


def _parse_multiline_table(text: str) -> List[LineItem]:
    """Parse PDF tables where each column renders on its own line.
    Detects the header row (Description / CPT Code / Qty / ... / Amount)
    then groups subsequent lines into records.
    """
    lines = [l.strip() for l in text.split('\n')]
    items: List[LineItem] = []

    # Find table header
    header_idx = None
    for i, line in enumerate(lines):
        if line.lower() in ("description", "service description"):
            # Check if the next few lines look like column headers
            upcoming = " ".join(lines[i:i+5]).lower()
            if "amount" in upcoming:
                header_idx = i
                break

    if header_idx is None:
        return []

    # Count header lines (skip until we hit actual data)
    data_start = header_idx
    for i in range(header_idx, min(header_idx + 6, len(lines))):
        if lines[i].lower() in ("description", "cpt code", "qty",
                                  "unit price", "amount", "quantity",
                                  "charge", "code"):
            data_start = i + 1
        else:
            break

    # Skip words that indicate end of table or non-charge rows
    skip_words = ["subtotal", "total", "balance", "payment", "insurance",
                  "adjustment", "discount", "credit", "due within",
                  "computer-generated", "disregard"]

    # Parse groups of lines as records
    i = data_start
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue

        # Stop if we hit subtotal/total section
        if any(w in line.lower() for w in skip_words):
            break

        # A description line: not a number, not a dollar amount, has letters
        if re.search(r'[a-zA-Z]', line) and not re.match(r'^[\$\d,.\-\s]+$', line):
            desc = line
            cpt = None
            amount = None

            # Look ahead for CPT code, quantity, prices
            lookahead = []
            j = i + 1
            while j < len(lines) and j <= i + 6:
                next_line = lines[j].strip()
                if not next_line:
                    j += 1
                    continue
                # If next line looks like a new description, stop
                if (re.search(r'[a-zA-Z]', next_line)
                    and not re.match(r'^[\$\d,.\-\s]+$', next_line)
                    and not re.match(r'^[A-Z]{2,5}(-[A-Z])?$', next_line)
                    and not re.match(r'^\d{5}$', next_line)):
                    break
                lookahead.append((j, next_line))
                j += 1

            # Extract data from lookahead lines
            amounts = []
            for _, val in lookahead:
                # CPT code: exactly 5 digits
                if re.match(r'^\d{5}$', val):
                    cpt = val
                # Custom codes like ROOM, PHARM, IV-SET
                elif re.match(r'^[A-Z]{2,5}(-[A-Z]+)?$', val):
                    cpt = val
                # Dollar amount
                elif re.match(r'^\$[\d,]+\.\d{2}$', val):
                    amounts.append(float(val.replace('$', '').replace(',', '')))
                # Plain number (qty)
                elif re.match(r'^\d{1,3}$', val):
                    pass  # quantity — skip
                # Negative dollar (adjustment)
                elif re.match(r'^-\$[\d,]+\.\d{2}$', val):
                    pass  # adjustment

            # The last dollar amount is typically the line total
            if amounts:
                amount = amounts[-1]

            if amount and amount > 0:
                if any(w in desc.lower() for w in skip_words):
                    i = j
                    continue
                category = _classify_category(desc)
                items.append(LineItem(
                    description=desc,
                    cpt_code=cpt,
                    amount=amount,
                    category=category,
                ))
            i = j
        else:
            i += 1

    return items


def _parse_single_line(text: str) -> List[LineItem]:
    """Fallback: parse lines where description and amount are on the same line."""
    items: List[LineItem] = []
    line_pattern = r'(.+?)\s+\$?\s*([\d,]+\.\d{2})\s*$'

    skip_words = ["subtotal", "total", "balance", "payment", "insurance",
                  "adjustment", "discount", "credit"]

    for line in text.split('\n'):
        line = line.strip()
        if not line:
            continue
        match = re.search(line_pattern, line)
        if match:
            desc = match.group(1).strip()
            amount_str = match.group(2).replace(",", "")
            try:
                amount = float(amount_str)
            except ValueError:
                continue

            if amount < 0.01 or amount > 999999:
                continue
            if any(w in desc.lower() for w in skip_words):
                continue

            cpt = None
            cpt_match = re.search(r'\b(\d{5})\b', desc)
            if cpt_match:
                cpt = cpt_match.group(1)
                desc = desc.replace(cpt, "").strip(" -–—")

            category = _classify_category(desc)
            items.append(LineItem(
                description=desc,
                cpt_code=cpt,
                amount=amount,
                category=category,
            ))

    return items


def _classify_category(description: str) -> str:
    """Classify a line item description into a billing category."""
    desc_lower = description.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in desc_lower for kw in keywords):
            return category
    return "General"


def _extract_total(text: str) -> Optional[float]:
    """Try to extract the total amount from the bill."""
    patterns = [
        r'total\s*(?:charges?|amount|due|balance)?\s*:?\s*\$?\s*([\d,]+\.\d{2})',
        r'amount\s*due\s*:?\s*\$?\s*([\d,]+\.\d{2})',
        r'balance\s*(?:due|forward)?\s*:?\s*\$?\s*([\d,]+\.\d{2})',
        r'grand\s*total\s*:?\s*\$?\s*([\d,]+\.\d{2})',
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            try:
                return float(match.group(1).replace(",", ""))
            except ValueError:
                continue
    return None


def _extract_patient_name(text: str) -> Optional[str]:
    """Try to extract patient name from the bill."""
    patterns = [
        r'patient\s*(?:name)?\s*:?\s*([A-Z][a-zA-Z]+\s+[A-Z][a-zA-Z]+)',
        r'name\s*:?\s*([A-Z][a-zA-Z]+\s+[A-Z][a-zA-Z]+)',
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(1).strip()
    return None


def _extract_provider_name(text: str) -> Optional[str]:
    """Try to extract provider/facility name from the bill."""
    patterns = [
        r'(?:hospital|clinic|medical center|healthcare|facility)\s*:?\s*(.+)',
        r'(?:provider|physician|doctor|dr\.?)\s*:?\s*([A-Z][a-zA-Z\s\.]+)',
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip()[:100]
    return None


def _extract_date(text: str) -> Optional[str]:
    """Try to extract date of service from the bill."""
    patterns = [
        r'date\s*(?:of\s*service)?\s*:?\s*(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})',
        r'service\s*date\s*:?\s*(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})',
        r'(\d{1,2}[/\-]\d{1,2}[/\-]\d{4})',
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1)
    return None


async def enhance_with_hf_ner(text: str, entities: List[ExtractedEntity]) -> List[ExtractedEntity]:
    """Optionally enhance entity extraction using HuggingFace NER model."""
    settings = get_settings()
    if not settings.hf_api_token:
        return entities

    headers = {"Authorization": f"Bearer {settings.hf_api_token}"}
    truncated = text[:2000]
    
    try:
        resp = requests.post(
            f"https://api-inference.huggingface.co/models/{settings.hf_ner_model}",
            headers=headers,
            json={"inputs": truncated},
            timeout=15
        )
        resp.raise_for_status()
        
        results = resp.json()
        if isinstance(results, list):
            for ent in results:
                if isinstance(ent, dict) and "word" in ent:
                    entities.append(ExtractedEntity(
                        text=ent["word"],
                        label=ent.get("entity_group", ent.get("entity", "MEDICAL")),
                        confidence=ent.get("score", 0.5),
                    ))
    except Exception as e:
        logger.warning(f"HF NER enhancement failed: {e}. Falling back to Google Gemini...")
        return await enhance_with_google_ner(text, entities)

    return entities

async def enhance_with_google_ner(text: str, entities: List[ExtractedEntity]) -> List[ExtractedEntity]:
    """Fallback to Google Gemini API for NER enhancement."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.warning("No GEMINI_API_KEY found for fallback.")
        return entities

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        prompt = (
            "Extract medical entities (drugs, procedures, diagnoses) from this text. "
            "Return ONLY a JSON array of objects with 'word' and 'label' (e.g., MEDICAL, DRUG, CPT). "
            f"Text:\n{text[:2000]}"
        )
        resp = requests.post(
            url,
            json={"contents": [{"parts": [{"text": prompt}]}]},
            timeout=15
        )
        resp.raise_for_status()
        data = resp.json()
        raw_output = data["candidates"][0]["content"]["parts"][0]["text"]
        
        # simple parsing of JSON from markdown
        if "```json" in raw_output:
            raw_output = raw_output.split("```json")[1].split("```")[0]
        elif "```" in raw_output:
            raw_output = raw_output.split("```")[1].split("```")[0]
            
        results = json.loads(raw_output.strip())
        if isinstance(results, list):
            for ent in results:
                if isinstance(ent, dict) and "word" in ent:
                    entities.append(ExtractedEntity(
                        text=ent["word"],
                        label=ent.get("label", "MEDICAL"),
                        confidence=0.9,
                    ))
    except Exception as e:
        logger.warning(f"Google Gemini NER fallback failed: {e}")

    return entities
