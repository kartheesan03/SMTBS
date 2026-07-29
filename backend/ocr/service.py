import os
import sys
import io
import easyocr
from pdf2image import convert_from_path
import numpy as np

# Fix Windows console encoding — force UTF-8 for stdout/stderr
# This prevents 'charmap' codec errors from EasyOCR's progress bar (uses █ U+2588)
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

reader = None

def get_reader():
    global reader
    if reader is None:
        # verbose=False suppresses the progress bar that contains █ characters
        reader = easyocr.Reader(['en'], gpu=False, verbose=False)
    return reader

def sanitize_text(text: str) -> str:
    """Remove non-encodable characters that break Windows cp1252 codec."""
    if not text:
        return ""
    # Keep only standard printable chars, newlines, tabs — strip block elements etc.
    return text.encode('utf-8', errors='replace').decode('utf-8', errors='replace')

def process_document(filepath: str, is_pdf: bool) -> tuple[int, str]:
    """
    Extracts text from a document. Returns (number_of_pages, extracted_text).
    """
    extracted_text = []
    num_pages = 0
    ocr_reader = get_reader()

    if is_pdf:
        # Convert PDF to list of PIL Images
        # Note: poppler must be installed on the system
        images = convert_from_path(filepath)
        num_pages = len(images)
        for i, img in enumerate(images):
            # Convert PIL image to numpy array for EasyOCR
            img_np = np.array(img)
            # Read text
            results = ocr_reader.readtext(img_np, detail=0, paragraph=True)
            page_text = "\n".join(sanitize_text(r) for r in results)
            extracted_text.append(f"--- Page {i+1} ---\n{page_text}\n")
    else:
        # It's an image
        num_pages = 1
        results = ocr_reader.readtext(filepath, detail=0, paragraph=True)
        page_text = "\n".join(sanitize_text(r) for r in results)
        extracted_text.append(page_text)

    full_text = "\n".join(extracted_text)
    return num_pages, full_text

