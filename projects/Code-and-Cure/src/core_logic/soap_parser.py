"""SOAP parsing logic module."""

import re

from src.core_logic.models import SoapNote

SOAP_SECTION_PATTERN = re.compile(
    r"(?is)\b(subjective|objective|assessment|plan)\s*:\s*"
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
        # Fallback: keep source text as subjective when no markers exist.
        return SoapNote(subjective=text)

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

