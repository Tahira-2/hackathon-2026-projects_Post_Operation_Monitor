from __future__ import annotations

import re
from pathlib import Path
from dataclasses import dataclass
from typing import Iterable

from src.inference.classifier_predictor import ClassifierPredictor
from src.inference.ner_predictor import NerPredictor
from src.inference.summarizer import generate_note


SYMPTOM_KEYWORDS = (
    "headache",
    "headaches",
    "dizzy",
    "dizziness",
    "chest pain",
    "fatigue",
    "fever",
    "nausea",
    "cough",
    "pain",
    "shortness of breath",
)

CONDITION_KEYWORDS = (
    "hypertension",
    "diabetes",
    "asthma",
    "migraine",
    "infection",
    "anemia",
)

ADVICE_KEYWORDS = (
    "reduce salt",
    "reduced salt",
    "walk",
    "exercise",
    "hydrate",
    "follow up",
    "rest",
    "avoid",
)

INSTRUCTION_KEYWORDS = (
    "morning",
    "evening",
    "night",
    "daily",
    "twice daily",
    "with food",
    "before meals",
    "after meals",
)

MEDICINE_PATTERN = re.compile(r"\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)\b")
DOSAGE_PATTERN = re.compile(r"\b\d+(?:\.\d+)?\s?(?:mg|mcg|g|ml|units|tablet(?:s)?|capsule(?:s)?)\b", re.IGNORECASE)
NOISE_MEDICINE_WORDS = {
    "doctor",
    "patient",
    "please",
    "take",
    "prescribed",
    "add",
    "increase",
    "reports",
    "advised",
}

CONVERSATIONAL_WORDS = {
    "good",
    "sharma",
    "what",
    "mild",
    "some",
    "type",
    "fasting",
    "understood",
    "today",
    "continue",
    "increase",
    "reduce",
    "come",
    "okay",
}

PRESCRIPTION_HINTS = (
    "prescribe",
    "prescribed",
    "take",
    "continue",
    "increase",
    "decrease",
    "add",
    "dose",
    "tablet",
    "capsule",
)


def _dedupe(items: Iterable[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for item in items:
        cleaned = item.strip()
        normalized = cleaned.lower()
        if cleaned and normalized not in seen:
            seen.add(normalized)
            result.append(cleaned)
    return result


def _find_keywords(text: str, keywords: Iterable[str]) -> list[str]:
    lowered = text.lower()
    matches = [keyword for keyword in keywords if keyword in lowered]
    return _dedupe(matches)


def _split_sentences(transcript: str) -> list[str]:
    parts = re.split(r"[\n\r]+|(?<=[.!?])\s+", transcript)
    cleaned: list[str] = []
    for part in parts:
        stripped = part.strip()
        if not stripped:
            continue
        stripped = re.sub(r"^(Doctor|Patient)\s*:\s*", "", stripped, flags=re.IGNORECASE)
        if stripped:
            cleaned.append(stripped)
    return cleaned


def _clean_entity_text(text: str) -> str:
    cleaned = text.strip().replace("##", "")
    cleaned = re.sub(r"\s+", " ", cleaned)
    cleaned = re.sub(r"^[^A-Za-z0-9]+|[^A-Za-z0-9]+$", "", cleaned)
    cleaned = re.sub(r"^(continue|increase|decrease|take|add)\s+", "", cleaned, flags=re.IGNORECASE)
    return cleaned


def _postprocess_result(result: dict[str, list[str]]) -> dict[str, list[str]]:
    medicines: list[str] = []
    for medicine in result["medicines"]:
        cleaned = _clean_entity_text(medicine)
        lowered = cleaned.lower()
        if not cleaned:
            continue
        if lowered in NOISE_MEDICINE_WORDS:
            continue
        if len(cleaned) <= 3:
            continue
        medicines.append(cleaned)

    symptoms = [_clean_entity_text(item) for item in result["symptoms"] if _clean_entity_text(item)]
    symptom_set = {item.lower() for item in symptoms}
    if "chest pain" in symptom_set and "pain" in symptom_set:
        symptoms = [item for item in symptoms if item.lower() != "pain"]

    return {
        "symptoms": symptoms,
        "conditions": [_clean_entity_text(item) for item in result["conditions"] if _clean_entity_text(item)],
        "medicines": medicines,
        "dosages": [_clean_entity_text(item) for item in result["dosages"] if _clean_entity_text(item)],
        "instructions": [_clean_entity_text(item) for item in result["instructions"] if _clean_entity_text(item)],
        "advice": [_clean_entity_text(item) for item in result["advice"] if _clean_entity_text(item)],
    }


@dataclass
class ExtractionResult:
    symptoms: list[str]
    conditions: list[str]
    medicines: list[str]
    dosages: list[str]
    instructions: list[str]
    advice: list[str]

    def as_dict(self) -> dict[str, list[str] | str]:
        payload = {
            "symptoms": self.symptoms,
            "conditions": self.conditions,
            "medicines": self.medicines,
            "dosages": self.dosages,
            "instructions": self.instructions,
            "advice": self.advice,
        }
        payload["summary"] = generate_note(payload)
        return payload


class MedicalExtractionPipeline:
    def __init__(self, ner_model_path: str | Path = "models/ner_model", classifier_model_path: str | Path = "models/classifier_model"):
        self.ner_predictor = NerPredictor(ner_model_path)
        self.classifier_predictor = ClassifierPredictor(classifier_model_path)

    def _classify_intent(self, sentence: str) -> str:
        if self.classifier_predictor.is_available():
            return self.classifier_predictor.predict(sentence)

        lowered = sentence.lower()
        if any(keyword in lowered for keyword in SYMPTOM_KEYWORDS):
            return "SYMPTOM_REPORT"
        if any(keyword in lowered for keyword in ADVICE_KEYWORDS):
            return "ADVICE"
        if any(keyword in lowered for keyword in ("history", "had", "previous", "surgery")):
            return "HISTORY"
        if any(keyword in lowered for keyword in ("prescribe", "take", "add", "increase", "mg", "tablet", "capsule")):
            return "PRESCRIPTION"
        return "OTHER"

    def _extract_with_heuristics(self, sentence: str, intent: str, result: dict[str, list[str]]) -> None:
        result["symptoms"].extend(_find_keywords(sentence, SYMPTOM_KEYWORDS))
        result["conditions"].extend(_find_keywords(sentence, CONDITION_KEYWORDS))
        result["advice"].extend(_find_keywords(sentence, ADVICE_KEYWORDS))
        result["instructions"].extend(_find_keywords(sentence, INSTRUCTION_KEYWORDS))

        lowered_sentence = sentence.lower()
        for match in DOSAGE_PATTERN.findall(sentence):
            result["dosages"].append(match.strip())

        should_extract_medicine = (
            intent == "PRESCRIPTION"
            or bool(DOSAGE_PATTERN.search(sentence))
            or any(hint in lowered_sentence for hint in PRESCRIPTION_HINTS)
        )
        if not should_extract_medicine:
            return

        for match in MEDICINE_PATTERN.findall(sentence):
            lower = match.lower()
            if lower in NOISE_MEDICINE_WORDS:
                continue
            if lower in CONVERSATIONAL_WORDS:
                continue
            if len(match) < 3:
                continue
            result["medicines"].append(match.strip())

    def _extract_with_models(self, sentence: str, result: dict[str, list[str]]) -> None:
        entities = self.ner_predictor.predict(sentence)
        for entity in entities:
            label = str(entity.get("entity_group") or entity.get("entity", "")).upper()
            text = str(entity.get("word", "")).strip()
            if not text:
                continue
            if label.startswith("B-") or label.startswith("I-"):
                label = label[2:]
            if label == "MEDICINE":
                # For medicine names, rules are more stable than this fast model on long conversational text.
                continue
            if label in {"SYMPTOM", "CONDITION", "MEDICINE", "DOSAGE", "INSTRUCTION", "ADVICE"}:
                key = {
                    "SYMPTOM": "symptoms",
                    "CONDITION": "conditions",
                    "MEDICINE": "medicines",
                    "DOSAGE": "dosages",
                    "INSTRUCTION": "instructions",
                    "ADVICE": "advice",
                }[label]
                result[key].append(text)

    def extract(self, transcript: str) -> dict[str, list[str] | str]:
        result = {
            "symptoms": [],
            "conditions": [],
            "medicines": [],
            "dosages": [],
            "instructions": [],
            "advice": [],
        }

        for sentence in _split_sentences(transcript):
            intent = self._classify_intent(sentence)
            # Always run rules so obvious fields (dosage/instructions/advice) are not missed.
            self._extract_with_heuristics(sentence, intent, result)
            if self.ner_predictor.is_available() and intent in {"SYMPTOM_REPORT", "PRESCRIPTION", "ADVICE", "HISTORY"}:
                self._extract_with_models(sentence, result)

        result = _postprocess_result(result)

        result = ExtractionResult(
            symptoms=_dedupe(result["symptoms"]),
            conditions=_dedupe(result["conditions"]),
            medicines=_dedupe(result["medicines"]),
            dosages=_dedupe(result["dosages"]),
            instructions=_dedupe(result["instructions"]),
            advice=_dedupe(result["advice"]),
        )
        return result.as_dict()
