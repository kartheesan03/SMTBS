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

from services.ocr_parser import process_document

import pytesseract
from PIL import Image
import re

_reader = None
def _get_reader():
    global _reader
    if _reader is None:
        try:
            import easyocr
            # Note: gpu=False since we assume CPU environments, but will use GPU if available
            _reader = easyocr.Reader(['en'], gpu=False)
        except ImportError:
            logger.error("EasyOCR not installed. Please run: pip install easyocr")
            raise
    return _reader

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

def preprocess_image(img_path: str) -> str:
    """Preprocess image for better OCR results."""
    t0 = time.time()
    try:
        import cv2
        import numpy as np
        from PIL import Image, ImageOps

        # 1. EXIF Correction (using PIL)
        try:
            with Image.open(img_path) as pil_img:
                pil_img = ImageOps.exif_transpose(pil_img)
                # Save to a temporary path if EXIF correction changed the image
                # To be safe, just save it out so OpenCV reads the corrected version
                ext = os.path.splitext(img_path)[1]
                temp_path = img_path.replace(ext, f"_exif{ext}")
                pil_img.save(temp_path)
                img_path = temp_path
                logger.info("[PREPROCESS] EXIF orientation corrected.")
        except Exception as e:
            logger.warning(f"[PREPROCESS] EXIF correction skipped or failed: {e}")

        # 2. Read with OpenCV
        img = cv2.imread(img_path)
        if img is None:
            logger.error("cv2.imread failed to load image.")
            return img_path

        # 3. Detect Rotation (pytesseract OSD)
        try:
            import pytesseract
            osd = pytesseract.image_to_osd(img)
            rot_match = re.search(r'Rotate: (\d+)', str(osd))
            if rot_match:
                angle = int(rot_match.group(1))
                if angle == 90:
                    img = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
                elif angle == 180:
                    img = cv2.rotate(img, cv2.ROTATE_180)
                elif angle == 270:
                    img = cv2.rotate(img, cv2.ROTATE_90_COUNTERCLOCKWISE)
                if angle in [90, 180, 270]:
                    logger.info(f"[PREPROCESS] Rotated image by {angle} degrees.")
        except Exception as e:
            logger.warning(f"[PREPROCESS] Rotation detection skipped: {e}")

        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # 4. Deskewing
        try:
            # Threshold to find text contours
            _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)
            coords = np.column_stack(np.where(thresh > 0))
            angle = cv2.minAreaRect(coords)[-1]
            
            # minAreaRect returns angle in range [-90, 0)
            if angle < -45:
                angle = -(90 + angle)
            else:
                angle = -angle

            if -15 <= angle <= 15 and abs(angle) > 0.5: # only deskew if reasonable angle and not ~0
                (h, w) = img.shape[:2]
                center = (w // 2, h // 2)
                M = cv2.getRotationMatrix2D(center, angle, 1.0)
                img = cv2.warpAffine(img, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                logger.info(f"[PREPROCESS] Deskewed image by {angle:.2f} degrees.")
        except Exception as e:
            logger.warning(f"[PREPROCESS] Deskewing failed: {e}")

        # 5. Denoising
        gray = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)

        # 6. Contrast Enhancement (CLAHE)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        
        # 7. Adaptive Thresholding (useful for shadows)
        # We only apply this if contrast is low or text is very faint. 
        # For simplicity and reliability on receipts, adaptive thresholding is often a net positive.
        # But it can destroy images if used blindly, so we'll use a conservative approach or stick to enhanced.
        # Let's apply a slight sharpening filter instead for blurry text
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        if laplacian_var < 100: # Blur detected
            kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
            enhanced = cv2.filter2D(enhanced, -1, kernel)
            logger.info(f"[PREPROCESS] Applied sharpening (laplacian variance: {laplacian_var:.1f}).")

        ext = os.path.splitext(img_path)[1]
        out_path = img_path.replace(ext, f"_preproc{ext}")
        cv2.imwrite(out_path, enhanced)
        
        # Clean up the intermediate EXIF file if we created one
        if "_exif" in img_path and os.path.exists(img_path):
            try: os.remove(img_path)
            except: pass
            
        logger.info(f"[PREPROCESS] Image preprocessing took {time.time()-t0:.2f}s")
        return out_path
    except Exception as e:
        logger.error(f"[PREPROCESS] Preprocessing failed: {e}")
        return img_path

def _ocr_image_elements(img_path: str, page_num: int = 1) -> list:
    """Run OCR and return structured bounding box elements."""
    t0 = time.time()
    logger.info(f"[TIMING] EasyOCR page {page_num}: starting...")
    
    # Apply Image Preprocessing
    processed_path = preprocess_image(img_path)
    
    reader = _get_reader()
    
    try:
        results = reader.readtext(processed_path)
    except Exception as e:
        logger.error(f"EasyOCR failed: {e}")
        return []
    finally:
        # Cleanup preprocessed image if it's different from original
        if processed_path != img_path and os.path.exists(processed_path):
            try: os.remove(processed_path)
            except: pass
        
    logger.info(f"[TIMING] EasyOCR page {page_num}: {time.time()-t0:.1f}s")
    
    elements = []
    
    for bbox, text, conf in results:
        text = str(text)
        if not text or not text.strip():
            continue
            
        try:
            conf = float(conf)
        except ValueError:
            conf = 0.0
            
        if conf < 0:
            conf = 0.0
            
        text = clean_ocr_text(text)
        if not text:
            continue
            
        # bbox is a list of 4 coordinates: [top_left, top_right, bottom_right, bottom_left]
        # each coordinate is a list/tuple: [x, y]
        # We need: x0 (min x), x1 (max x), y0 (min y), y1 (max y)
        x_coords = [point[0] for point in bbox]
        y_coords = [point[1] for point in bbox]
        
        x0 = float(min(x_coords))
        x1 = float(max(x_coords))
        y0 = float(min(y_coords))
        y1 = float(max(y_coords))
        
        elements.append({
            "text": text,
            "confidence": conf,
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

    # ÔöÇÔöÇ PDF: Extract text directly or fallback to OCR ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
    if ext == ".pdf":
        try:
            import pymupdf as fitz  # PyMuPDF (replaces deprecated `import fitz`)
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
                    logger.warning(f"[TIMING] {num_pages}-page scanned PDF ÔÇö limiting OCR to first {max_pages} pages at {dpi} DPI")
                
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

    # ── DOCX: Extract paragraphs AND native tables ──────────────────────────────
    elif ext in [".docx", ".doc"]:
        try:
            import docx as _docx
        except ImportError:
            raise RuntimeError("python-docx is not installed. Run: pip install python-docx")

        from services.ocr_parser import process_docx_document
        result = process_docx_document(file_path)
        logger.info(f"[TIMING] DOCX extraction done in {time.time()-t_start:.2f}s")
        return result
        
    # ÔöÇÔöÇ Images: pass directly to EasyOCR ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
    else:
        t_img = time.time()
        all_elements = _ocr_image_elements(file_path, page_num=1)
        logger.info(f"[TIMING] Image OCR done in {time.time()-t_img:.2f}s")
        
    t_parse = time.time()
    result = process_document(all_elements)
    logger.info(f"[TIMING] process_document done in {time.time()-t_parse:.2f}s, total={time.time()-t_start:.2f}s")
    
    import json
    logger.info("=== DEBUG: FINAL API PAYLOAD ===")
    logger.info(json.dumps(result, indent=2))
    logger.info("================================")
    
    return result
