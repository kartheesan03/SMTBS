import re
import math
from typing import List, Dict, Any, Tuple, Optional
import logging

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# UTILITY: Number parsing
# ---------------------------------------------------------------------------

def parse_number(text: str) -> float:
    if not text:
        return 0.0
    clean = re.sub(r'[^\d\.\,\-]', '', text)
    if not clean:
        return 0.0
    if clean.count(',') > 0 and clean.count('.') == 1:
        clean = clean.replace(',', '')
    elif clean.count(',') == 1 and clean.count('.') == 0:
        parts = clean.split(',')
        if len(parts[1]) == 2:
            clean = clean.replace(',', '.')
        else:
            clean = clean.replace(',', '')
    else:
        clean = clean.replace(',', '')
    try:
        return float(clean)
    except Exception:
        return 0.0


def _looks_numeric(text: str) -> bool:
    """Return True if text is primarily a number/currency value."""
    stripped = re.sub(r'[^\w]', '', text)
    return bool(re.match(r'^[\$₹Rs]?\d[\d,\.]*$', stripped, re.IGNORECASE))


# ---------------------------------------------------------------------------
# LINE GROUPING
# ---------------------------------------------------------------------------

def group_into_lines(elements: List[Dict], y_tolerance: int = 15) -> List[List[Dict]]:
    elements = sorted(elements, key=lambda e: e['y0'])
    lines: List[List[Dict]] = []
    current_line: List[Dict] = []
    current_y: Optional[float] = None

    for el in elements:
        if current_y is None:
            current_y = (el['y0'] + el['y1']) / 2
            current_line.append(el)
        else:
            el_y = (el['y0'] + el['y1']) / 2
            if abs(el_y - current_y) <= y_tolerance:
                current_line.append(el)
                current_y = sum((e['y0'] + e['y1']) / 2 for e in current_line) / len(current_line)
            else:
                lines.append(sorted(current_line, key=lambda e: e['x0']))
                current_line = [el]
                current_y = (el['y0'] + el['y1']) / 2

    if current_line:
        lines.append(sorted(current_line, key=lambda e: e['x0']))

    return lines


# ---------------------------------------------------------------------------
# STRUCTURAL TABLE DETECTION
# ---------------------------------------------------------------------------

def _line_column_positions(line: List[Dict]) -> List[float]:
    return [(el['x0'] + el['x1']) / 2 for el in line]


def _alignment_score(header_positions: List[float], data_line: List[Dict], tolerance: float = 60.0) -> float:
    if not data_line or not header_positions:
        return 0.0
    matched = 0
    for hx in header_positions:
        for el in data_line:
            el_mid = (el['x0'] + el['x1']) / 2
            if abs(el_mid - hx) <= tolerance:
                matched += 1
                break
    return matched / len(header_positions)


def _is_header_candidate(line: List[Dict], next_lines: List[List[Dict]], min_cols: int = 2) -> bool:
    """
    Structural table header detection — stronger than the previous version.
    Requirements:
    1. At least min_cols elements
    2. Horizontal spread > 150px (was 80px — catches false positives)
    3. Header elements must be predominantly TEXT (not numbers/currency)
    4. At least one following data row must align under the header columns
    """
    if len(line) < min_cols:
        return False

    positions = _line_column_positions(line)
    if len(positions) < min_cols:
        return False

    x_range = max(positions) - min(positions)
    # Stronger threshold — avoids treating "PAID  $4,500" as a header
    if x_range < 150:
        return False

    # Header elements must be mostly text labels, not numbers
    numeric_count = sum(1 for el in line if _looks_numeric(el['text']))
    if numeric_count > len(line) / 2:
        return False

    # Check alignment with subsequent data rows
    data_lines = [l for l in next_lines[:5] if l]
    if not data_lines:
        return False

    best_score = max(_alignment_score(positions, dl) for dl in data_lines)
    return best_score >= 0.4


def detect_all_tables(lines: List[List[Dict]]) -> List[Tuple[str, List[Dict], int, int]]:
    """
    Generic structural table detection. No hardcoded column names.
    Returns list of (title, columns, start_idx, end_idx) tuples.
    """
    tables = []
    current_search_start = 0
    FOOTER_MARKERS = [
        "SUBTOTAL", "SUB TOTAL", "GRAND TOTAL", "TAXABLE VALUE",
        "TOTAL AMOUNT", "AMOUNT IN WORDS", "IN WORDS",
        "SIGNATURE", "AUTHORISED SIGNATORY"
    ]

    while current_search_start < len(lines):
        table_start_idx = -1
        columns: List[Dict] = []

        for i in range(current_search_start, len(lines)):
            candidate = lines[i]
            next_lines = lines[i + 1:]

            if _is_header_candidate(candidate, next_lines, min_cols=2):
                table_start_idx = i
                seen_keys: Dict[str, int] = {}
                for el in candidate:
                    key = el["text"].strip()
                    if not key:
                        continue
                    if key in seen_keys:
                        seen_keys[key] += 1
                        key = f"{key} ({seen_keys[key]})"
                    else:
                        seen_keys[key] = 1
                    columns.append({
                        "key": key,
                        "x0": el["x0"],
                        "x1": el["x1"]
                    })
                logger.info(f"[detect_all_tables] Table header at line {i}: {[c['key'] for c in columns]}")
                break

        if table_start_idx == -1 or not columns:
            break
            
        title = "Extracted Table"
        if table_start_idx > 0:
            candidate_title = " ".join([e["text"] for e in lines[table_start_idx - 1]]).strip()
            if len(candidate_title) >= 3 and not candidate_title.isdigit():
                title = candidate_title

        table_end_idx = len(lines)
        header_positions = _line_column_positions(lines[table_start_idx])

        for i in range(table_start_idx + 1, len(lines)):
            line_text = " ".join([e["text"].upper() for e in lines[i]])
            if any(k in line_text for k in FOOTER_MARKERS):
                table_end_idx = i
                break
            if i > table_start_idx + 3:
                streak = 0
                for j in range(max(table_start_idx + 1, i - 3), i + 1):
                    if _alignment_score(header_positions, lines[j]) < 0.1:
                        streak += 1
                if streak >= 3:
                    table_end_idx = i - 2
                    break

        tables.append((title, columns, table_start_idx, table_end_idx))
        current_search_start = table_end_idx + 1

    return tables


def detect_table(lines: List[List[Dict]]) -> Tuple[str, List[Dict], int, int]:
    results = detect_all_tables(lines)
    if results:
        return results[0]
    return "", [], -1, len(lines)


def extract_table_rows(lines: List[List[Dict]], columns: List[Dict]) -> List[Dict]:
    items = []
    empty_row: Dict[str, Any] = {col["key"]: "" for col in columns}
    col_tolerance = 60

    for line in lines:
        if not line:
            continue

        row_data = empty_row.copy()
        row_data["confidence"] = 0.0

        confidences = []
        is_empty_row = True

        for el in line:
            el_mid = (el['x0'] + el['x1']) / 2
            best_col = None
            best_dist = float('inf')

            for col in columns:
                col_mid = (col['x0'] + col['x1']) / 2
                dist = abs(el_mid - col_mid)
                if col['x0'] - col_tolerance <= el_mid <= col['x1'] + col_tolerance:
                    if dist < best_dist:
                        best_dist = dist
                        best_col = col

            if best_col:
                col_key = best_col["key"]
                text = el["text"]
                confidences.append(el.get("confidence", 1.0))
                is_empty_row = False

                if row_data[col_key]:
                    row_data[col_key] += " " + text
                else:
                    row_data[col_key] = text

        if not is_empty_row:
            row_data["confidence"] = round(
                sum(confidences) / len(confidences) if confidences else 1.0, 4
            )
            first_col_key = columns[0]["key"]
            if not row_data.get(first_col_key, "").strip() and items:
                for k, v in row_data.items():
                    if k not in ("confidence",) and v:
                        if items[-1].get(k):
                            items[-1][k] += " " + v
                        else:
                            items[-1][k] = v
            else:
                items.append(row_data)

    valid_items = []
    for it in items:
        has_data = any(bool(str(it.get(col["key"], "")).strip()) for col in columns)
        if has_data:
            it["row_number"] = len(valid_items) + 1
            valid_items.append(it)

    return valid_items


# ---------------------------------------------------------------------------
# DOCUMENT CLASSIFICATION
# ---------------------------------------------------------------------------

def detect_document_class(lines: List[List[Dict]]) -> Tuple[bool, str, str, float]:
    return False, "General", "General Document", 1.0


# ---------------------------------------------------------------------------
# GENERIC KV PAIR EXTRACTION (replaces narrow extract_metadata)
# ---------------------------------------------------------------------------

def extract_all_kv_pairs(lines: List[List[Dict]]) -> Tuple[Dict[str, str], List[List[Dict]]]:
    """Removed KV pair extraction as per new table-first requirements."""
    return {}, lines


def extract_unstructured_text(lines: List[List[Dict]]) -> str:
    text_blocks = []
    current_page = None

    for line in lines:
        if not line:
            continue
        page = line[0].get("page", 1)
        if current_page != page:
            if current_page is not None:
                text_blocks.append(f"\n--- PAGE {page} ---\n")
            current_page = page

        line_text = " ".join(e["text"] for e in line)
        text_blocks.append(line_text)

    return "\n".join(text_blocks).strip()


# ---------------------------------------------------------------------------
# TOTALS EXTRACTION (unchanged)
# ---------------------------------------------------------------------------

def extract_totals(lines: List[List[Dict]]) -> Dict:
    return None

def extract_payroll_totals(lines: List[List[Dict]]) -> Dict:
    return None


# ---------------------------------------------------------------------------
# SECTION BUILDING
# ---------------------------------------------------------------------------

def _build_kv_section(title: str, kv_dict: Dict[str, str]) -> Dict:
    return {}

def _guess_section_title(columns: List[Dict], doc_type: str) -> str:
    return "Data Table"


# ---------------------------------------------------------------------------
# MAIN PROCESS DOCUMENT — returns sections[]
# ---------------------------------------------------------------------------

def process_document(elements: List[Dict]) -> Dict:
    if not elements:
        return {
            "success": True,
            "document": {
                "type": "General Document",
                "module": "General",
                "isRelated": False,
                "isStructured": False,
                "tableDetected": False,
                "confidence": 0.0,
                "pageCount": 1,
                "details": {}
            },
            "sections": [],
            "tables": [],  # backward compat
            "rawText": "",
            "vendor": None,
            "invoice": None,
            "totals": None
        }

    lines = group_into_lines(elements)

    # 1. Classify document
    is_related, module_name, doc_type, base_class_conf = detect_document_class(lines)
    raw_text = extract_unstructured_text(lines)

    # 2. Extract ALL generic KV pairs first (before table detection)
    #    We extract them for Document Metadata, but DO NOT consume the lines.
    global_kv, _ = extract_all_kv_pairs(lines)

    # 3. Detect formal tables using the full document lines
    detected_tables = detect_all_tables(lines)

    # 4. Build sections[] — ONLY real detected tables, NO KV sections
    sections = []

    for idx, (title, columns, t_start_idx, t_end_idx) in enumerate(detected_tables):
        table_lines = lines[t_start_idx + 1:t_end_idx]
        items = extract_table_rows(table_lines, columns)
        if not items:
            continue
        
        col_keys = [col["key"] for col in columns]
        rows = []
        for item in items:
            row = []
            for k in col_keys:
                row.append(str(item.get(k, "") or ""))
            rows.append(row)

        sections.append({
            "title": title,
            "headers": col_keys,
            "rows": rows
        })

    is_structured = len(sections) > 0
    table_detected = len(sections) > 0

    # 5. Confidence
    all_char_conf = [e["confidence"] for e in elements if "confidence" in e]
    char_conf = sum(all_char_conf) / len(all_char_conf) if all_char_conf else 1.0
    all_pages = set(e.get("page", 1) for e in elements)
    page_count = len(all_pages) if all_pages else 1
    final_confidence = (base_class_conf + char_conf) / 2 if is_related else char_conf

    # 6. Totals & Vendor fields (removed per table-first design)
    totals = None
    vendor = None
    invoice = None

    return {
        "success": True,
        "document": {
            "type": doc_type,
            "module": module_name,
            "isRelated": is_related,
            "isStructured": is_structured,
            "tableDetected": table_detected,
            "confidence": round(final_confidence, 4),
            "pageCount": page_count,
            "details": global_kv  # keep details for backward compat
        },
        "sections": sections,
        "tables": sections,  # backward compat alias
        "rawText": raw_text,
        "vendor": vendor,
        "invoice": invoice,
        "totals": totals
    }


# ---------------------------------------------------------------------------
# DOCX DOCUMENT PROCESSING (unchanged entry point)
# ---------------------------------------------------------------------------

def process_docx_document(file_path: str) -> Dict:
    """Extract structure from a .docx file using python-docx native tables."""
    import docx as _docx

    document = _docx.Document(file_path)
    sections: List[Dict] = []
    kv_pairs: Dict[str, str] = {}
    raw_lines = []

    # Extract paragraphs (KV pairs and text)
    for para in document.paragraphs:
        text = para.text.strip()
        if not text:
            continue
        raw_lines.append(text)

        # Try KV extraction
        m = _KV_COLON.match(text)
        if m:
            key = m.group("key").strip()
            val = m.group("val").strip()
            if len(key) >= 2 and len(val) >= 1:
                kv_pairs[key] = val

    if kv_pairs:
        pass # KV section removed per new table-first design

    # Extract native Word tables
    for tbl_idx, table in enumerate(document.tables):
        if not table.rows:
            continue
        header_row = table.rows[0]
        columns = [cell.text.strip() for cell in header_row.cells if cell.text.strip()]
        if not columns:
            continue

        rows = []
        for row_idx, row in enumerate(table.rows[1:], start=1):
            cells = [cell.text.strip() for cell in row.cells]
            if not any(cells):
                continue
            row_data = []
            for col_idx in range(len(columns)):
                row_data.append(cells[col_idx] if col_idx < len(cells) else "")
            rows.append(row_data)

        if rows:
            sections.append({
                "title": f"Table {tbl_idx + 1}",
                "headers": columns,
                "rows": rows
            })

    raw_text = "\n".join(raw_lines)
    is_structured = len(sections) > 0

    is_related, module_name, doc_type, base_conf = detect_document_class(
        [[{"text": t, "x0": 0, "y0": i * 20, "x1": 100, "y1": (i + 1) * 20}]
         for i, t in enumerate(raw_lines)]
    ) if raw_lines else (False, "General", "General Document", 1.0)

    return {
        "success": True,
        "document": {
            "type": doc_type,
            "module": module_name,
            "isRelated": is_related,
            "isStructured": is_structured,
            "tableDetected": any(s["type"] == "table" for s in sections),
            "confidence": round(base_conf, 4),
            "pageCount": 1,
            "details": kv_pairs
        },
        "sections": sections,
        "tables": sections,
        "rawText": raw_text,
        "vendor": None,
        "invoice": None,
        "totals": None
    }
