"""SOAP note PDF rendering helpers."""

from datetime import datetime

from src.core_logic.models import SoapNote


def _pdf_escape(value: str) -> str:
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def _soap_lines(note: SoapNote) -> list[str]:
    generated_on = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
    return [
        "ABC HOSPITAL",
        "Clinical Documentation Unit",
        "Official SOAP Medical Note",
        f"Generated: {generated_on}",
        "-" * 70,
        "",
        f"Subjective: {note.subjective or 'Not provided'}",
        f"Objective: {note.objective or 'Not provided'}",
        f"Assessment: {note.assessment or 'Not provided'}",
        f"Plan: {note.plan or 'Not provided'}",
        "",
        "-" * 70,
        "ABC HOSPITAL | Authorized Clinical Document",
    ]


def render_soap_note_pdf_bytes(note: SoapNote) -> bytes:
    """Render a single-page PDF as bytes for downstream review workflows.

    This is a pure in-memory transformation:
    - no file writes
    - no network I/O
    - no third-party dependencies
    """
    lines = _soap_lines(note)
    y_pos = 760
    text_commands: list[str] = ["BT", "/F1 12 Tf"]
    for line in lines:
        escaped = _pdf_escape(line)
        text_commands.append(f"1 0 0 1 50 {y_pos} Tm ({escaped}) Tj")
        y_pos -= 20
    text_commands.append("ET")
    stream = "\n".join(text_commands).encode("latin-1", errors="replace")

    objects: list[bytes] = [
        b"1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n",
        b"2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n",
        b"3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj\n",
        b"4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n",
        b"5 0 obj << /Length "
        + str(len(stream)).encode("ascii")
        + b" >> stream\n"
        + stream
        + b"\nendstream endobj\n",
    ]

    pdf = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for obj in objects:
        offsets.append(len(pdf))
        pdf.extend(obj)

    xref_start = len(pdf)
    pdf.extend(f"xref\n0 {len(offsets)}\n".encode("ascii"))
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode("ascii"))

    pdf.extend(
        (
            "trailer\n"
            f"<< /Size {len(offsets)} /Root 1 0 R >>\n"
            "startxref\n"
            f"{xref_start}\n"
            "%%EOF\n"
        ).encode("ascii")
    )
    return bytes(pdf)
