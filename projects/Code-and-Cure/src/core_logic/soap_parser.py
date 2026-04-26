"""SOAP parsing logic module."""

import re

from src.core_logic.models import SoapNote

SOAP_SECTION_PATTERN = re.compile(
    r"(?is)\b(subjective|objective|assessment|plan)\s*:\s*"
)


def _heuristic_split(text: str) -> SoapNote:
    sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]
    if not sentences:
        return SoapNote(subjective=text.strip())
    if len(sentences) == 1:
        return SoapNote(subjective=sentences[0])

    objective_cues = ("bp", "heart rate", "temperature", "exam", "vitals", "observed", "physical")
    assessment_cues = ("likely", "impression", "diagnosis", "consistent with", "suggests")
    plan_cues = ("plan", "follow-up", "start", "prescribe", "advise", "recommend", "return if", "order")

    subjective_parts: list[str] = []
    objective_parts: list[str] = []
    assessment_parts: list[str] = []
    plan_parts: list[str] = []

    for sentence in sentences:
        lower = sentence.lower()
        if any(cue in lower for cue in plan_cues):
            plan_parts.append(sentence)
        elif any(cue in lower for cue in assessment_cues):
            assessment_parts.append(sentence)
        elif any(cue in lower for cue in objective_cues):
            objective_parts.append(sentence)
        else:
            subjective_parts.append(sentence)

    if not objective_parts and len(sentences) >= 2:
        objective_parts.append(sentences[1])
    if not assessment_parts and len(sentences) >= 3:
        assessment_parts.append(sentences[-2])
    if not plan_parts and len(sentences) >= 1:
        plan_parts.append(sentences[-1])

    return SoapNote(
        subjective=" ".join(subjective_parts).strip(),
        objective=" ".join(objective_parts).strip(),
        assessment=" ".join(assessment_parts).strip(),
        plan=" ".join(plan_parts).strip(),
    )


def parse_transcript_to_soap(transcript: str) -> SoapNote:
    """Parse free-text transcript content into SOAP sections.

    Rules:
    - Section markers are case-insensitive.
    - Missing sections return empty strings.
    - Parsing is deterministic and non-diagnostic.
    """
    text = transcript.strip()
    if not text:
        return SoapNote()

    matches = list(SOAP_SECTION_PATTERN.finditer(text))
    if not matches:
        # Heuristic fallback for plain transcripts without explicit SOAP headings.
        return _heuristic_split(text)

    sections: dict[str, str] = {
        "subjective": "",
        "objective": "",
        "assessment": "",
        "plan": "",
    }

    for index, match in enumerate(matches):
        label = match.group(1).lower()
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        content = text[start:end].strip()
        sections[label] = content

    return SoapNote(
        subjective=sections["subjective"],
        objective=sections["objective"],
        assessment=sections["assessment"],
        plan=sections["plan"],
    )

