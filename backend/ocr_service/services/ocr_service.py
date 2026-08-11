import sys
import io
import os
import uuid
import time
import logging
from typing import Optional

# Fix Windows console encoding (EasyOCR progress bar uses block chars)
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

reader = None

from services.ocr_parser import process_document

def _init_reader():
    global reader
    if reader is not None:
        return reader
    logger.info("Initializing EasyOCR reader...")
    import easyocr
    reader = easyocr.Reader(["en"], gpu=False, verbose=False)
    logger.info("EasyOCR reader initialized successfully.")
    return reader

import re

def clean_ocr_text(text: str) -> str:
    """Universally clean and normalize OCR text."""
    # 1. Boilerplate prefixes
    text = re.sub(r'^(?:For|M/S)\s+', '', text, flags=re.IGNORECASE)
    
    # 2. Universal Character substitutions
    text = text.replace('rn', 'm').replace('RN', 'M')
    
    # Fix 'O'/'OO' used as zeros in numeric contexts
    text = re.sub(r'(?<=\d)\s*OO\b', '.00', text, flags=re.IGNORECASE)
    text = re.sub(r'(?<=\d)\s*O\b', '0', text, flags=re.IGNORECASE)
    
    # Also handle letter O in place of 0
    text = re.sub(r'\b(?P<num>\d+)[O]+\b', lambda m: m.group("num") + "0" * (len(m.group(0)) - len(m.group("num"))), text, flags=re.IGNORECASE)
    text = re.sub(r'\b(?P<num>[L])00\s*OO\b', r'100.00', text, flags=re.IGNORECASE)
    text = re.sub(r'\b(?P<num>\d+)00\s*OO\b', r'\g<num>00.00', text, flags=re.IGNORECASE)
    text = re.sub(r'\b(?P<num>\d+)\s*OO\b', r'\g<num>.00', text, flags=re.IGNORECASE)
    text = text.replace("L00", "100")
    
    # 3. Custom OCR typo dictionary (case-insensitive)
    corrections = {
        "CIIARGES": "Charges",
        "GCNCRAL": "General",
        "PCINT TIME": "Print Time",
        "MRS;": "Mrs.",
        "MULTISPECIALLTY": "Multispeciality",
        "SURGERY": "Surgery"
    }
    for wrong, right in corrections.items():
        if wrong in text.upper():
            text = re.sub(re.escape(wrong), right, text, flags=re.IGNORECASE)
            
    # 4. Number normalization
    # Comma as decimal
    text = re.sub(r'(\d+),(\d{2})\b', r'\1.\2', text)
    
    # 5. Trim trailing punctuation often left by receipts (:, -, etc.)
    text = text.strip(':-., ')
    
    return text.strip()

def _ocr_image_elements(img_path: str, page_num: int = 1) -> list:
    """Run OCR and return structured bounding box elements."""
    r = _init_reader()
    t0 = time.time()
    result = r.readtext(img_path)
    logger.info(f"[TIMING] EasyOCR page {page_num}: {time.time()-t0:.1f}s, {len(result)} elements")
    
    elements = []
    
    for (bbox, text, conf) in result:
        text = clean_ocr_text(text)
        if not text:
            continue
        
        # bbox is typically [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]
        x0 = min(pt[0] for pt in bbox)
        y0 = min(pt[1] for pt in bbox)
        x1 = max(pt[0] for pt in bbox)
        y1 = max(pt[1] for pt in bbox)
        
        elements.append({
            "text": text,
            "confidence": float(conf),
            "x0": x0,
            "y0": y0,
            "x1": x1,
            "y1": y1,
            "page": page_num
        })
    return elements

def extract_text(file_path: str, ext: Optional[str] = None) -> dict:
    t_start = time.time()
    ext = (ext or os.path.splitext(file_path)[1]).lower()
    all_elements = []

    # ── PDF: Extract text directly or fallback to OCR ────────────────
    if ext == ".pdf":
        try:
            import fitz  # PyMuPDF
        except ImportError:
            raise RuntimeError("PyMuPDF is not installed. Run: pip install pymupdf")

        doc = fitz.open(file_path)
        tmp_dir = os.path.dirname(file_path)
        num_pages = len(doc)
        logger.info(f"[TIMING] PDF opened: {num_pages} page(s), size={os.path.getsize(file_path)//1024}KB, t={time.time()-t_start:.2f}s")
        
        # 1. Try to extract text directly from the PDF text layer
        text_layer_found = False
        total_chars = 0
        
        t_text = time.time()
        for page_num in range(num_pages):
            page = doc[page_num]
            text_dict = page.get_text("dict")
            
            if not isinstance(text_dict, dict):
                continue
                
            for block in text_dict.get("blocks", []):
                if block.get("type") == 0:  # Text block
                    for line in block.get("lines", []):
                        for span in line.get("spans", []):
                            text = span.get("text", "").strip()
                            if text:
                                total_chars += len(text)
                                bbox = span.get("bbox") # [x0, y0, x1, y1]
                                all_elements.append({
                                    "text": text,
                                    "confidence": 1.0, # Text layer is 100% accurate
                                    "x0": bbox[0],
                                    "y0": bbox[1],
                                    "x1": bbox[2],
                                    "y1": bbox[3],
                                    "page": page_num + 1
                                })
        
        # If we extracted a reasonable amount of text, we can skip OCR!
        if total_chars > 50:
            text_layer_found = True
            logger.info(f"[TIMING] Direct PDF text extraction: {total_chars} chars in {time.time()-t_text:.2f}s")
            
        # 2. Fallback to OCR if it's a scanned PDF
        if not text_layer_found:
            logger.info(f"[TIMING] No text layer. Falling back to EasyOCR at t={time.time()-t_start:.2f}s")
            all_elements = [] # Clear any garbage detected
            
            # Use lower DPI for faster OCR:
            # - Single-page docs: 120 DPI (good quality, 36% fewer pixels vs 150)
            # - Multi-page docs: 96 DPI and limit to first 2 pages
            if num_pages == 1:
                dpi = 120
                max_pages = 1
            else:
                dpi = 96
                max_pages = min(2, num_pages)
                if num_pages > 2:
                    logger.warning(f"[TIMING] {num_pages}-page scanned PDF — limiting OCR to first {max_pages} pages at {dpi} DPI")
                
            for page_num in range(max_pages):
                page = doc[page_num]
                pix = page.get_pixmap(dpi=dpi)
                tmp_img = os.path.join(tmp_dir, f"_page_{uuid.uuid4()}.png")
                try:
                    pix.save(tmp_img)
                    page_elements = _ocr_image_elements(tmp_img, page_num=page_num+1)
                    all_elements.extend(page_elements)
                finally:
                    if os.path.exists(tmp_img):
                        os.remove(tmp_img)

        doc.close()

    # ── DOCX: Extract text directly ──────────────────────────────────────────
    elif ext in [".docx", ".doc"]:
        try:
            import docx
        except ImportError:
            raise RuntimeError("python-docx is not installed. Run: pip install python-docx")
        
        doc = docx.Document(file_path)
        y_pos = 0
        for para in doc.paragraphs:
            text = para.text.strip()
            if text:
                all_elements.append({
                    "text": text,
                    "confidence": 1.0,
                    "x0": 0,
                    "y0": y_pos,
                    "x1": 500,
                    "y1": y_pos + 15,
                    "page": 1
                })
                y_pos += 20
        logger.info(f"[TIMING] DOCX extraction done in {time.time()-t_start:.2f}s")
        
    # ── Images: pass directly to EasyOCR ─────────────────────────────────────
    else:
        t_img = time.time()
        all_elements = _ocr_image_elements(file_path, page_num=1)
        logger.info(f"[TIMING] Image OCR done in {time.time()-t_img:.2f}s")
        
    t_parse = time.time()
    result = process_document(all_elements)
    logger.info(f"[TIMING] process_document done in {time.time()-t_parse:.2f}s, total={time.time()-t_start:.2f}s")
    return result
