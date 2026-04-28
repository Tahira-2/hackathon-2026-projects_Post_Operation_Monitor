from __future__ import annotations

from pathlib import Path


class Summarizer:
    def __init__(self, model_path: str | Path = "facebook/bart-large-cnn"):
        self.model_path = str(model_path)
        self._pipeline = None

    def _load(self):
        from transformers import pipeline

        if self._pipeline is None:
            self._pipeline = pipeline("summarization", model=self.model_path)
        return self._pipeline

    def summarize(self, text: str) -> str:
        if len(text.split()) < 60:
            return text

        try:
            summarizer = self._load()
            result = summarizer(text, max_length=120, min_length=30, do_sample=False)
            return result[0]["summary_text"]
        except Exception:
            return text


def generate_note(extracted: dict) -> str:
    sections: list[str] = []

    symptoms = extracted.get("symptoms", [])
    conditions = extracted.get("conditions", [])
    medicines = extracted.get("medicines", [])
    dosages = extracted.get("dosages", [])
    instructions = extracted.get("instructions", [])
    advice = extracted.get("advice", [])

    if symptoms:
        sections.append(f"Symptoms: {', '.join(symptoms)}.")
    if conditions:
        sections.append(f"Conditions: {', '.join(conditions)}.")
    if medicines:
        # Pair medicines with dose/instruction only when list sizes align; otherwise keep fields separate.
        if len(medicines) == len(dosages) == len(instructions) and len(medicines) > 0:
            medication_notes: list[str] = []
            for index, medicine in enumerate(medicines):
                snippet = f"{medicine} {dosages[index]} ({instructions[index]})"
                medication_notes.append(snippet)
            sections.append(f"Medicines: {', '.join(medication_notes)}.")
        else:
            sections.append(f"Medicines: {', '.join(medicines)}.")
            if dosages:
                sections.append(f"Dosages: {', '.join(dosages)}.")
            if instructions:
                sections.append(f"Instructions: {', '.join(instructions)}.")
    if advice:
        sections.append(f"Advice: {', '.join(advice)}.")

    return " ".join(sections)

