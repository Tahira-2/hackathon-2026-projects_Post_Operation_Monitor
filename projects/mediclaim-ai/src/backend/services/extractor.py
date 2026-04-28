"""
MediClaim AI — PDF Text Extraction
PyMuPDF for native PDFs, Tesseract OCR fallback for scanned documents.
"""

import fitz  # PyMuPDF
import io
import logging
import re
from typing import Optional

logger = logging.getLogger(__name__)

# Try importing Tesseract — optional dependency
try:
    import pytesseract
    from PIL import Image
    HAS_TESSERACT = True
except ImportError:
    HAS_TESSERACT = False
    logger.warning("pytesseract not available — OCR fallback disabled")


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extract text from a PDF file.
    1. Try PyMuPDF native text extraction first.
    2. If that yields very little or garbage text, fall back to Tesseract OCR.
    """
    text = _extract_with_pymupdf(pdf_bytes)

    # If native extraction got very little valid text, try OCR
    if not _is_valid_text(text) and HAS_TESSERACT:
        logger.info("Native extraction yielded little/invalid text, trying OCR...")
        ocr_text = _extract_with_ocr(pdf_bytes)
        if _is_valid_text(ocr_text) or len(ocr_text.strip()) > len(text.strip()):
            text = ocr_text

    return _clean_ocr_text(text)

def _is_valid_text(text: str) -> bool:
    """Check if the extracted text is meaningful and not just phantom garbage."""
    if len(text.strip()) < 50:
        return False
    # If less than 40% of the characters are alphanumeric, it's likely garbage
    alnum_count = sum(c.isalnum() for c in text)
    if alnum_count / max(len(text), 1) < 0.4:
        return False
    return True

def _clean_ocr_text(text: str) -> str:
    """Clean up common OCR misreads and formatting artifacts."""
    if not text:
        return text
        
    # Remove weird non-printable characters except newlines/tabs
    text = "".join(c for c in text if c.isprintable() or c in '\n\t')

    # Fix letter O or o being read instead of 0 in amounts (e.g. $1OO.OO -> $100.00)
    def fix_zeros(match):
        return match.group(0).replace('O', '0').replace('o', '0')
    
    text = re.sub(r'\$[\dOo,]+\.[Oo\d]{2}', fix_zeros, text)
    
    # Fix letter l or I being read instead of 1 in amounts
    def fix_ones(match):
        return match.group(0).replace('l', '1').replace('I', '1')
        
    text = re.sub(r'\$[lI\d,]+\.[lI\d]{2}', fix_ones, text)

    return text


def _extract_with_pymupdf(pdf_bytes: bytes) -> str:
    """Extract text using PyMuPDF's native text extraction."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    pages = []
    for page_num in range(len(doc)):
        page = doc[page_num]
        page_text = page.get_text("text")
        if page_text.strip():
            pages.append(f"--- Page {page_num + 1} ---\n{page_text}")
    doc.close()
    return "\n\n".join(pages)


def _extract_with_ocr(pdf_bytes: bytes) -> str:
    """Extract text by rendering PDF pages to images and running Tesseract OCR."""
    if not HAS_TESSERACT:
        return ""
        
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    pages = []
    for page_num in range(len(doc)):
        page = doc[page_num]
        # Render at 300 DPI for good OCR accuracy
        pix = page.get_pixmap(dpi=300)
        img = Image.open(io.BytesIO(pix.tobytes("png")))
        page_text = pytesseract.image_to_string(img)
        if page_text.strip():
            pages.append(f"--- Page {page_num + 1} (OCR) ---\n{page_text}")
    doc.close()
    return "\n\n".join(pages)
