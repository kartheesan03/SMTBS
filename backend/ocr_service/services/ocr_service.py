import sys
import io
import os
import uuid
import logging

# Fix Windows console encoding (EasyOCR progress bar uses block chars)
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

reader = None

def _init_reader():
    global reader
    if reader is not None:
        return reader
    logger.info("Initializing EasyOCR reader...")
    import easyocr
    reader = easyocr.Reader(["en"], gpu=False, verbose=False)
    logger.info("EasyOCR reader initialized successfully.")
    return reader

def _ocr_image_file(r, img_path: str) -> str:
    """Run OCR on a single image file and return extracted text."""
    result = r.readtext(img_path)
    return " ".join([text for (_, text, _) in result])

def extract_text(file_path: str, ext: str = None) -> str:
    r = _init_reader()
    ext = (ext or os.path.splitext(file_path)[1]).lower()

    # ── PDF: convert each page to PNG, run OCR, then clean up ────────────────
    if ext == ".pdf":
        try:
            import fitz  # PyMuPDF
        except ImportError:
            raise RuntimeError("PyMuPDF is not installed. Run: pip install pymupdf")

        doc = fitz.open(file_path)
        all_text = []
        tmp_dir = os.path.dirname(file_path)

        for page_num in range(len(doc)):
            page = doc[page_num]
            # Render at 150 DPI for a good quality/speed balance
            pix = page.get_pixmap(dpi=150)
            tmp_img = os.path.join(tmp_dir, f"_page_{uuid.uuid4()}.png")
            try:
                pix.save(tmp_img)
                page_text = _ocr_image_file(r, tmp_img)
                if page_text.strip():
                    all_text.append(f"--- Page {page_num + 1} ---\n{page_text.strip()}")
            finally:
                if os.path.exists(tmp_img):
                    os.remove(tmp_img)

        doc.close()
        return "\n\n".join(all_text) if all_text else "(No readable text found in PDF)"

    # ── Images: pass directly to EasyOCR ─────────────────────────────────────
    else:
        text = _ocr_image_file(r, file_path)
        return text.strip() if text.strip() else "(No text detected in image)"
