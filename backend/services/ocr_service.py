"""
ocr_service.py
──────────────
Production-grade multi-stage OCR pipeline.

Pipeline per image:
  1. Perspective correction & document crop
  2. Deskew
  3. Upscale if needed
  4. Noise removal (fastNlMeans)
  5. CLAHE contrast enhancement
  6. Adaptive thresholding
  7. Sharpen
  8. EasyOCR full-image pass
  9. Per-region enhancement for low-confidence / small text
     (upscale → sharpen → CLAHE → Otsu → vote best result)
  10. Line grouping & invoice parsing

PDF support:
  - Uses pymupdf (fitz) to render each page to a high-resolution image
  - Processes each page independently
  - Aggregates OCR results across pages

Confidence levels:
  - >= 0.95 → High (green)
  - >= 0.80 → Review (amber)
  - <  0.80 → Needs Verification (red) — NOT guessed, flagged instead
"""

import cv2
import numpy as np
import traceback
import base64
import os
import tempfile
from typing import List, Dict, Any, Optional

import sys as _sys
_here = os.path.dirname(os.path.abspath(__file__))      # .../backend/services
_backend = os.path.dirname(_here)                        # .../backend
for _p in [_backend, _here]:
    if _p not in _sys.path:
        _sys.path.insert(0, _p)

import easyocr

# Try both import styles so the module works from any working directory
try:
    from services.invoice_parser import parse_invoice
    from services.validator import validate_invoice, generate_fingerprint
except ModuleNotFoundError:
    from invoice_parser import parse_invoice                       # type: ignore[import]
    from validator import validate_invoice, generate_fingerprint   # type: ignore[import]


# ─── Singleton reader (expensive to init) ────────────────────────────────────
_reader: Optional[easyocr.Reader] = None

def _get_reader() -> easyocr.Reader:
    global _reader
    if _reader is None:
        _reader = easyocr.Reader(['en'], gpu=False)
    return _reader


# ─── Image preprocessing ──────────────────────────────────────────────────────

def _to_gray(img: np.ndarray) -> np.ndarray:
    """Convert BGR to grayscale if needed."""
    if img is None:
        raise ValueError("Image is None")
    return cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img.copy()


def _correct_perspective(gray: np.ndarray) -> np.ndarray:
    """
    Attempt to detect document edges and apply perspective correction.
    Falls back to the original image if detection fails.
    """
    try:
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edged = cv2.Canny(blurred, 50, 150)
        contours, _ = cv2.findContours(edged, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contours:
            return gray
        largest = max(contours, key=cv2.contourArea)
        peri = cv2.arcLength(largest, True)
        approx = cv2.approxPolyDP(largest, 0.02 * peri, True)
        if len(approx) == 4:
            pts = approx.reshape(4, 2).astype(np.float32)
            # Order: top-left, top-right, bottom-right, bottom-left
            s = pts.sum(axis=1)
            d = np.diff(pts, axis=1)
            ordered = np.array([
                pts[np.argmin(s)],   # TL
                pts[np.argmin(d)],   # TR
                pts[np.argmax(s)],   # BR
                pts[np.argmax(d)],   # BL
            ], dtype=np.float32)
            w = max(np.linalg.norm(ordered[1] - ordered[0]),
                    np.linalg.norm(ordered[2] - ordered[3]))
            h = max(np.linalg.norm(ordered[3] - ordered[0]),
                    np.linalg.norm(ordered[2] - ordered[1]))
            dst = np.array([[0, 0], [w-1, 0], [w-1, h-1], [0, h-1]], dtype=np.float32)
            M = cv2.getPerspectiveTransform(ordered, dst)
            warped = cv2.warpPerspective(gray, M, (int(w), int(h)))
            # Only use if the area is significant (not a tiny sliver)
            if warped.shape[0] > 100 and warped.shape[1] > 100:
                return warped
    except Exception:
        pass
    return gray


def _deskew(gray: np.ndarray) -> np.ndarray:
    """Correct skew angle using minAreaRect on foreground pixels."""
    try:
        coords = np.column_stack(np.where(gray < 200))  # dark pixels
        if len(coords) < 10:
            return gray
        angle = cv2.minAreaRect(coords)[-1]
        if angle < -45:
            angle = -(90 + angle)
        else:
            angle = -angle
        if abs(angle) > 0.5:
            (h, w) = gray.shape[:2]
            M = cv2.getRotationMatrix2D((w // 2, h // 2), angle, 1.0)
            gray = cv2.warpAffine(gray, M, (w, h),
                                  flags=cv2.INTER_CUBIC,
                                  borderMode=cv2.BORDER_REPLICATE)
    except Exception:
        pass
    return gray


def preprocess(img: np.ndarray) -> np.ndarray:
    """
    Full preprocessing pipeline:
    perspective → deskew → upscale → denoise → CLAHE → adaptive threshold → sharpen
    """
    gray = _to_gray(img)
    gray = _correct_perspective(gray)
    gray = _deskew(gray)

    # Upscale small images
    h, w = gray.shape[:2]
    if h < 1200 or w < 900:
        scale = max(1200 / h, 900 / w, 1.5)
        gray = cv2.resize(gray, None, fx=scale, fy=scale,
                          interpolation=cv2.INTER_CUBIC)

    # Denoise
    gray = cv2.fastNlMeansDenoising(gray, None, h=10, searchWindowSize=21)

    # CLAHE
    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
    gray = clahe.apply(gray)

    # Adaptive threshold (Gaussian) — better than global for uneven lighting
    binary = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY, 31, 11
    )

    # Sharpen
    kernel = np.array([[-1, -1, -1],
                       [-1,  9, -1],
                       [-1, -1, -1]])
    sharpened = cv2.filter2D(binary, -1, kernel)

    return sharpened


# ─── Per-region enhancement ────────────────────────────────────────────────────

def _enhance_region(reader: easyocr.Reader, crop: np.ndarray,
                    original_text: str, original_conf: float):
    """
    Run multiple OCR passes on a single cropped region and return the
    (text, confidence) candidate with the highest confidence.
    Never invents text — returns original if all passes score lower.
    """
    candidates = [(original_text, original_conf)]

    def _try_pass(image):
        try:
            r = reader.recognize(image, detail=1, decoder='greedy')
            if r and len(r[0]) > 2:
                return (r[0][1], float(r[0][2]))
        except Exception:
            pass
        return None

    # Pass 1: 2× upscale + sharpen
    scaled = cv2.resize(crop, None, fx=2.0, fy=2.0, interpolation=cv2.INTER_CUBIC)
    sharp = cv2.filter2D(scaled, -1, np.array([[-1,-1,-1],[-1,9,-1],[-1,-1,-1]]))
    res = _try_pass(sharp)
    if res:
        candidates.append(res)

    # Pass 2: 1.5× + CLAHE + Otsu
    small = cv2.resize(crop, None, fx=1.5, fy=1.5, interpolation=cv2.INTER_CUBIC)
    cl = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(small)
    _, bw = cv2.threshold(cl, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    res2 = _try_pass(bw)
    if res2:
        candidates.append(res2)

    # Pass 3: Bilateral filter + threshold
    try:
        bil = cv2.bilateralFilter(crop, 9, 75, 75)
        _, bw3 = cv2.threshold(bil, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        res3 = _try_pass(bw3)
        if res3:
            candidates.append(res3)
    except Exception:
        pass

    candidates.sort(key=lambda x: x[1], reverse=True)
    return candidates[0]


# ─── PDF rendering ─────────────────────────────────────────────────────────────

def _pdf_to_images(pdf_path: str) -> List[np.ndarray]:
    """
    Convert each page of a PDF to a high-resolution numpy image array.
    Uses pymupdf (fitz). Returns list of BGR images.
    """
    try:
        import fitz  # type: ignore[import]  # pymupdf — installed in .venv
    except ImportError:
        raise RuntimeError(
            "pymupdf is not installed. Run: pip install pymupdf\n"
            "PDF support requires pymupdf."
        )

    doc = fitz.open(pdf_path)
    images = []
    for page in doc:
        # Render at 2× resolution for better OCR
        mat = fitz.Matrix(2.0, 2.0)
        pix = page.get_pixmap(matrix=mat, alpha=False)
        data = pix.tobytes("png")
        arr = np.frombuffer(data, dtype=np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if img is not None:
            images.append(img)
    doc.close()
    return images


# ─── OCR on a single image ────────────────────────────────────────────────────

def _ocr_single_image(reader: easyocr.Reader, img: np.ndarray) -> List[Dict]:
    """
    Run full preprocessing + OCR on a single image.
    Returns list of item dicts with text, conf, bbox, coordinates.
    """
    processed = preprocess(img)
    raw_results = reader.readtext(processed)
    if not raw_results:
        return []

    h, w = processed.shape[:2]
    results = []

    for bbox, text, conf in raw_results:
        tl, tr, br, bl = bbox
        x_min = int(min(tl[0], bl[0]))
        x_max = int(max(tr[0], br[0]))
        y_min = int(min(tl[1], tr[1]))
        y_max = int(max(bl[1], br[1]))
        height = max(1, y_max - y_min)

        # Enhance low-confidence or small-text regions
        if conf < 0.82 or height < 20:
            pad_h = max(4, int(height * 0.25))
            pad_w = max(4, int(height * 0.25))
            cx0 = max(0, x_min - pad_w)
            cy0 = max(0, y_min - pad_h)
            cx1 = min(w, x_max + pad_w)
            cy1 = min(h, y_max + pad_h)
            crop = processed[cy0:cy1, cx0:cx1]
            if crop.size > 0:
                text, conf = _enhance_region(reader, crop, text, conf)

        results.append({
            'text':  text,
            'conf':  round(float(conf), 4),
            'bbox':  [
                [int(tl[0]), int(tl[1])],
                [int(tr[0]), int(tr[1])],
                [int(br[0]), int(br[1])],
                [int(bl[0]), int(bl[1])],
            ],
            'x_min': x_min, 'y_min': y_min,
            'x_max': x_max, 'y_max': y_max,
            'height': height,
        })

    return results


# ─── Group items into lines ────────────────────────────────────────────────────

def _group_lines(items: List[Dict]) -> List[Dict]:
    """
    Sort OCR items by vertical position and group them into logical lines.
    Returns list of line dicts with 'text', 'conf', 'items', 'y_min', 'y_max'.
    """
    if not items:
        return []

    items_sorted = sorted(items, key=lambda r: r['y_min'])
    lines_objs = []
    current_line = []
    y_thresh = 0

    for item in items_sorted:
        if not current_line:
            current_line.append(item)
            y_thresh = max(12, item['height'] * 0.55)
        else:
            avg_cy = sum((i['y_min'] + i['y_max']) / 2 for i in current_line) / len(current_line)
            item_cy = (item['y_min'] + item['y_max']) / 2
            if abs(item_cy - avg_cy) < y_thresh:
                current_line.append(item)
            else:
                current_line.sort(key=lambda i: i['x_min'])
                lines_objs.append(current_line)
                current_line = [item]
                y_thresh = max(12, item['height'] * 0.55)

    if current_line:
        current_line.sort(key=lambda i: i['x_min'])
        lines_objs.append(current_line)

    line_list = []
    for line in lines_objs:
        line_text = ' '.join(item['text'] for item in line)
        line_conf = sum(item['conf'] for item in line) / len(line)
        line_list.append({
            'text':  line_text,
            'conf':  round(line_conf, 4),
            'items': line,
            'y_min': min(i['y_min'] for i in line),
            'y_max': max(i['y_max'] for i in line),
            'x_min': min(i['x_min'] for i in line),
        })

    return line_list


# ─── Main OCR service class ────────────────────────────────────────────────────

class OCRService:

    def extract_text(self, file_path: str) -> dict:
        """
        Main entry point. Accepts image files (jpg/jpeg/png/webp/tiff)
        or PDF files. Returns fully structured invoice data.
        """
        try:
            reader = _get_reader()
            ext = os.path.splitext(file_path)[1].lower()
            is_pdf = ext == '.pdf'

            all_items: List[Dict] = []
            page_count = 1
            processed_img_bgr = None   # for preview
            page_images: List[np.ndarray] = []

            if is_pdf:
                page_images = _pdf_to_images(file_path)
                if not page_images:
                    return self._empty_result('No renderable pages in PDF')
                page_count = len(page_images)
            else:
                img = cv2.imread(file_path)
                if img is None:
                    return self._empty_result('Cannot read image file')
                page_images = [img]

            # Run OCR on all pages / images
            for page_idx, page_img in enumerate(page_images):
                items = _ocr_single_image(reader, page_img)
                # Offset y-coords for pages after the first so lines stay ordered
                if page_idx > 0:
                    y_offset = 10000 * page_idx  # large enough to separate pages
                    for item in items:
                        item['y_min'] += y_offset
                        item['y_max'] += y_offset
                        for pt in item['bbox']:
                            pt[1] += y_offset
                all_items.extend(items)

            # Generate preview from first page
            if page_images:
                proc = preprocess(page_images[0])
                _, buf = cv2.imencode('.jpg', proc, [cv2.IMWRITE_JPEG_QUALITY, 85])
                processed_b64 = base64.b64encode(buf).decode('utf-8')
            else:
                processed_b64 = ''

            if not all_items:
                return self._empty_result('No text detected in document')

            # Group into lines and build raw text
            line_list = _group_lines(all_items)
            raw_text = '\n'.join(l['text'] for l in line_list)

            all_confs = [item['conf'] for item in all_items]
            avg_conf = sum(all_confs) / len(all_confs)

            # Parse invoice structure
            ocr_intermediate = {
                'lines':    line_list,
                'raw_text': raw_text,
                'field_confidence_raw': {},
            }
            structured = parse_invoice(ocr_intermediate)

            # Validate
            validation = validate_invoice(structured)

            # Fingerprint for duplicate detection
            vendor_name    = structured.get('vendor', {}).get('name', '')
            invoice_number = structured.get('invoice', {}).get('number', '')
            invoice_date   = structured.get('invoice', {}).get('date', '')
            grand_total    = structured.get('totals', {}).get('grand_total', '')
            fingerprint    = generate_fingerprint(vendor_name, invoice_number,
                                                  invoice_date, grand_total)

            # Build warnings
            warnings = []
            if avg_conf < 0.80:
                warnings.append(
                    f'Overall OCR confidence is low ({avg_conf*100:.0f}%). '
                    'Low-confidence fields are flagged for manual verification.'
                )
            low_conf_fields = [
                k for k, v in structured.get('field_confidence', {}).items()
                if v.get('needs_verification', False)
            ]
            if low_conf_fields:
                warnings.append(f'Fields needing verification: {", ".join(low_conf_fields)}')

            line_items = structured.get('line_items', {'columns': [], 'rows': []})

            return {
                # Structured invoice blocks
                'document_type':    structured.get('document_type', 'General'),
                'vendor':           structured.get('vendor', {}),
                'invoice':          structured.get('invoice', {}),
                'customer':         structured.get('customer', {}),
                'line_items':       line_items,
                'totals':           structured.get('totals', {}),
                'field_confidence': structured.get('field_confidence', {}),

                # Wrap in structured_data key too (for Node controller)
                'structured_data': {
                    'vendor':     structured.get('vendor', {}),
                    'invoice':    structured.get('invoice', {}),
                    'customer':   structured.get('customer', {}),
                    'line_items': line_items,
                    'totals':     structured.get('totals', {}),
                },

                # Validation & duplicate
                'validation':   validation,
                'fingerprint':  fingerprint,

                # Raw
                'raw_text':   raw_text,
                'confidence': round(avg_conf, 4),
                'page_count': page_count,
                'warnings':   warnings,

                # Processed preview
                'processed_image_base64': processed_b64,

                # Legacy compat fields
                'fields': {
                    'Vendor':      vendor_name,
                    'Invoice No':  invoice_number,
                    'Date':        invoice_date,
                    'Grand Total': grand_total,
                },
                'columns':     line_items.get('columns', []),
                'rows':        line_items.get('rows', []),
                'totals_flat': structured.get('totals', {}),
            }

        except Exception as e:
            traceback.print_exc()
            raise Exception(f"OCR processing failed: {str(e)}")

    def _empty_result(self, reason: str = 'No text detected') -> dict:
        return {
            'document_type': 'General',
            'vendor': {}, 'invoice': {}, 'customer': {},
            'line_items': {'columns': [], 'rows': []},
            'totals': {}, 'field_confidence': {},
            'structured_data': {
                'vendor': {}, 'invoice': {}, 'customer': {},
                'line_items': {'columns': [], 'rows': []}, 'totals': {},
            },
            'validation': {
                'checks': {}, 'issues': [{'field': 'document', 'type': 'empty',
                                           'message': reason}],
                'math_valid': True, 'overall_status': 'Needs_Verification',
                'issue_count': 1,
            },
            'fingerprint': '', 'raw_text': '', 'confidence': 0,
            'page_count': 0,
            'warnings': [reason],
            'processed_image_base64': '',
            'fields': {}, 'columns': [], 'rows': [], 'totals_flat': {},
        }


# ─── Singleton + public function ──────────────────────────────────────────────

ocr_service = OCRService()

def extract_text(file_path: str) -> dict:
    return ocr_service.extract_text(file_path)
