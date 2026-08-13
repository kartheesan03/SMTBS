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

    # Table headers almost never contain colons (which imply KV pairs)
    colon_count = sum(1 for el in line if ":" in el['text'])
    if colon_count > 0:
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
                
                # Merge elements that are close together (gap < 30px) to avoid splitting multi-word headers
                merged_candidate = []
                for el in sorted(candidate, key=lambda x: x["x0"]):
                    if not merged_candidate:
                        merged_candidate.append(el.copy())
                    else:
                        last_el = merged_candidate[-1]
                        gap = el["x0"] - last_el["x1"]
                        if gap < 30:
                            last_el["text"] = last_el["text"] + " " + el["text"]
                            last_el["x1"] = max(last_el["x1"], el["x1"])
                        else:
                            merged_candidate.append(el.copy())

                for el in merged_candidate:
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


def extract_receipt_items(lines: List[List[Dict]]) -> List[Dict]:
    items = []
    _RECEIPT_ITEM_PATTERN = re.compile(r'^(\d+)\s+(.+?)\s+([\d,\.]+)\s+([\d,\.]+)$')
    
    sno = 1
    for line in lines:
        if not line:
            continue
        line_text = " ".join([e["text"] for e in line]).strip()
        m = _RECEIPT_ITEM_PATTERN.match(line_text)
        if m:
            items.append({
                "S.No": str(sno),
                "Item": m.group(2).strip(),
                "Quantity": m.group(1),
                "Rate": m.group(3),
                "Amount": m.group(4)
            })
            sno += 1
            
    return items


# ---------------------------------------------------------------------------
# DOCUMENT CLASSIFICATION
# ---------------------------------------------------------------------------

def detect_document_class(lines: List[List[Dict]]) -> Tuple[bool, str, str, float]:
    return False, "General", "General Document", 1.0


# ---------------------------------------------------------------------------
# GENERIC KV PAIR EXTRACTION (replaces narrow extract_metadata)
# ---------------------------------------------------------------------------

def extract_generic_kv(line_text: str) -> Tuple[Optional[str], Optional[str]]:
    # Standard colon/dash
    m = re.match(r'^([a-zA-Z\s\.]+)(?:[:\-])\s*(.*)$', line_text)
    if m:
        k = m.group(1).strip()
        v = m.group(2).strip()
        if len(k) > 1 and len(v) > 0:
            return k, v
            
    # Date pattern
    m = re.match(r'^([a-zA-Z\s]+)(?:[:\-])?\s*(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})$', line_text)
    if m:
        return m.group(1).strip(), m.group(2).strip()
        
    # Mixed text and single number (e.g. ROOM 103 NO -> ROOM NO, 103)
    words = line_text.split()
    numbers = []
    texts = []
    for w in words:
        if re.search(r'\d', w):
            numbers.append(w)
        else:
            texts.append(w)
            
    if len(numbers) == 1 and len(texts) > 0:
        k = " ".join(texts)
        v = numbers[0]
        if len(k) > 2:
            return k, v
            
    return None, None


def extract_semantic_blocks(lines: List[List[Dict]]) -> Tuple[Dict, Dict, Dict, List[List[Dict]]]:
    doc_info = {}
    summary = {}
    address = {}
    remaining = []
    
    _SUMMARY_KEYS = ["TOTAL", "SUBTOTAL", "TAX", "DISCOUNT", "AMOUNT", "BALANCE", "DUE", "PAID"]
    _FOOTER_KEYS = ["THANK YOU", "PLEASE COME AGAIN", "VISIT AGAIN", "HAVE A NICE DAY"]
    
    address_lines = []
    
    for line in lines:
        if not line:
            continue
            
        line_text = " ".join([e["text"] for e in line]).strip()
        text_upper = line_text.upper()
        
        # 1. Footers
        if any(f in text_upper for f in _FOOTER_KEYS):
            continue
            
        # 2. Addresses
        if "ADDRESS" in text_upper or "FLOOR" in text_upper or "ROAD" in text_upper or "STREET" in text_upper or "COMPLEX" in text_upper or "CIRCLE" in text_upper or "CINEMA" in text_upper:
            clean = re.sub(r'^ADDRESS\s*[:\-]*\s*', '', text_upper)
            if clean:
                address_lines.append(clean)
            continue
            
        # 3. Summary
        summary_match = False
        for sk in _SUMMARY_KEYS:
            if sk in text_upper:
                nums = re.findall(r'[\d,\.]+', text_upper)
                if nums:
                    val = nums[-1]
                    # Ensure it's not a generic word matching, require it to be a key-value like structure
                    if len(nums) <= 2:
                        summary[sk.capitalize()] = val
                        summary_match = True
                        break
        if summary_match:
            continue
            
        # 4. Document Info
        k, v = extract_generic_kv(line_text)
        if k and v:
            doc_info[k.title()] = v
            continue
            
        remaining.append(line)
        
    if address_lines:
        address["Address"] = ", ".join(address_lines)
        
    return doc_info, summary, address, remaining


def extract_geometric_receipt_items(elements: List[Dict]) -> Tuple[List[Dict], List[Dict]]:
    import itertools
    items = []
    used_elements = []

    # 1. Isolate all numbers
    numeric_elements = []
    for el in elements:
        t = el.get("text", "").strip()
        clean_t = re.sub(r'[^\d\.]', '', t.replace(',', ''))
        if clean_t:
            try:
                val = float(clean_t)
                numeric_elements.append({
                    "el": el,
                    "val": val,
                    "x_mid": (el["x0"] + el["x1"]) / 2,
                    "y_mid": (el["y0"] + el["y1"]) / 2
                })
            except ValueError:
                pass

    if not numeric_elements:
        return items, elements

    # 2. Group numbers by Y-axis dynamically
    numeric_elements.sort(key=lambda x: x["y_mid"])
    y_groups = []
    current_group = []
    for ne in numeric_elements:
        if not current_group:
            current_group.append(ne)
        else:
            avg_y = sum(n["y_mid"] for n in current_group) / len(current_group)
            if abs(ne["y_mid"] - avg_y) < 20:
                current_group.append(ne)
            else:
                y_groups.append(current_group)
                current_group = [ne]
    if current_group:
        y_groups.append(current_group)

    # 3. Detect Table Boundaries (Layout Zones)
    y_end = float('inf')
    for el in elements:
        t = el.get("text", "").upper()
        if any(k in t for k in ["TOTAL", "SUBTOTAL", "TAX", "DISCOUNT", "AMOUNT"]):
            y_end = (el["y0"] + el["y1"]) / 2
            break

    y_start = -1
    for yg in y_groups:
        yg_y = sum(n["y_mid"] for n in yg) / len(yg)
        if yg_y > y_end:
            continue
        row_numbers = [n["val"] for n in yg]
        if len(row_numbers) >= 3:
            found = False
            for combo in itertools.permutations(row_numbers, 3):
                q, r, a = combo
                if q > 0 and r > 0 and a > 0 and abs(q * r - a) < 0.1:
                    y_start = yg_y - 30
                    found = True
                    break
            if found:
                break
        elif len(row_numbers) >= 2:
            r, a = row_numbers[0], row_numbers[1]
            if abs(r - a) < 0.1 and r > 0:
                y_start = yg_y - 30
                break

    if y_start == -1:
        y_start = 0

    sno = 1
    for yg in y_groups:
        if not yg:
            continue
            
        avg_y = sum(n["y_mid"] for n in yg) / len(yg)
        
        # STRICT ZONE ENFORCEMENT
        if avg_y < y_start or avg_y > y_end:
            continue
            
        yg.sort(key=lambda x: x["x_mid"]) # Left to right
        row_numbers = [ne["val"] for ne in yg]
        
        qty, rate, amt = None, None, None
        
        # 4. Strict Math Validation (Qty * Rate = Amount)
        if len(row_numbers) >= 3:
            found = False
            for combo in itertools.permutations(row_numbers, 3):
                q, r, a = combo
                if q > 0 and r > 0 and a > 0 and abs(q * r - a) < 0.1:
                    qty, rate, amt = q, r, a
                    found = True
                    break
            if not found and abs(row_numbers[-2] - row_numbers[-1]) < 0.1:
                qty, rate, amt = 1, row_numbers[-2], row_numbers[-1]
                
        elif len(row_numbers) == 2:
            r, a = row_numbers[0], row_numbers[1]
            if abs(r - a) < 0.1:
                qty, rate, amt = 1, r, a
            elif abs(2 * r - a) < 0.1:
                qty, rate, amt = 2, r, a
            elif abs(3 * r - a) < 0.1:
                qty, rate, amt = 3, r, a
                
        elif len(row_numbers) == 1:
            a = row_numbers[0]
            if a > 0:
                qty, rate, amt = 1, a, a

        if qty is not None and rate is not None and amt is not None:
            row_els = [el for el in elements if abs((el["y0"] + el["y1"])/2 - avg_y) < 20]
            row_els.sort(key=lambda x: x["x0"])
            
            used_nums = [qty, rate, amt]
            item_tokens = []
            
            for el in row_els:
                t = el["text"].strip()
                clean_t = re.sub(r'[^\d\.]', '', t.replace(',', ''))
                
                is_used_number = False
                if clean_t:
                    try:
                        val = float(clean_t)
                        for i, u in enumerate(used_nums):
                            if abs(u - val) < 0.1:
                                used_nums.pop(i)
                                is_used_number = True
                                if el not in used_elements:
                                    used_elements.append(el)
                                break
                    except ValueError:
                        pass
                        
                if not is_used_number:
                    item_tokens.append(t)
                    if el not in used_elements:
                        used_elements.append(el)

            item_name = " ".join(item_tokens).strip()
            item_name = re.sub(r'^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$', '', item_name).strip()
            
            if len(item_name) >= 2 and not any(k in item_name.upper() for k in ["TOTAL", "SUBTOTAL", "TAX", "DISCOUNT", "AMOUNT"]):
                items.append({
                    "S.No": str(sno),
                    "Item": item_name,
                    "Quantity": str(int(qty) if qty == int(qty) else qty),
                    "Rate": f"{rate:.2f}",
                    "Amount": f"{amt:.2f}"
                })
                sno += 1
                
    unused = [el for el in elements if el not in used_elements]
    return items, unused


# ---------------------------------------------------------------------------
# SECTION BUILDING
# ---------------------------------------------------------------------------

def _build_kv_section(title: str, kv_dict: Dict[str, str]) -> Dict:
    if not kv_dict:
        return {}
    rows = [[k, v] for k, v in kv_dict.items()]
    return {
        "title": title,
        "type": "table",
        "headers": ["Field", "Value"],
        "rows": rows
    }


# ---------------------------------------------------------------------------
# MAIN PROCESS DOCUMENT — returns sections[]
# ---------------------------------------------------------------------------

def process_document(elements: List[Dict]) -> Dict:
    if not elements:
        return {
            "success": True,
            "document": {"type": "General", "isStructured": False, "tableDetected": False, "confidence": 0.0, "details": {}},
            "sections": [],
            "tables": []
        }

    # 1. Geometric Math-Validated Line Item Extraction FIRST
    # (Doing this on raw elements prevents horizontal OCR skew merging and stops generic KVs from stealing items like "CURED 50.00")
    receipt_items, remaining_elements = extract_geometric_receipt_items(elements)

    # 2. Group remaining elements into horizontal lines
    lines = group_into_lines(remaining_elements)
    is_related, module_name, doc_type, base_class_conf = detect_document_class(lines)
    
    # 3. Semantic Block Extraction (Metadata, Summary, Address)
    doc_info, summary_kv, address_kv, remaining_lines = extract_semantic_blocks(lines)

    # 4. Geometric Table Detection (Fallback for other formal tables)
    detected_tables = detect_all_tables(remaining_lines)

    # 4. Build Sections
    sections = []
    
    if doc_info:
        sec = _build_kv_section("Document Information", doc_info)
        if sec: sections.append(sec)

    items_found = False
    
    # Add math-validated items first (highly accurate for receipts/invoices)
    if receipt_items:
        headers = ["S.No", "Item", "Quantity", "Rate", "Amount"]
        rows = [[it[h] for h in headers] for it in receipt_items]
        sections.append({
            "title": "Items",
            "type": "table",
            "headers": headers,
            "rows": rows
        })
        items_found = True

    # Add geometric tables
    for idx, (title, columns, t_start, t_end) in enumerate(detected_tables):
        t_lines = remaining_lines[t_start + 1:t_end]
        items = extract_table_rows(t_lines, columns)
        if items:
            col_keys = [col["key"] for col in columns]
            rows = [[str(item.get(k, "") or "") for k in col_keys] for item in items]
            sections.append({
                "title": title if title != "Extracted Table" else (f"Table {idx+1}" if items_found else "Items"),
                "type": "table",
                "headers": col_keys,
                "rows": rows
            })

    if summary_kv:
        sec = _build_kv_section("Summary", summary_kv)
        if sec: sections.append(sec)
            
    if address_kv:
        sec = _build_kv_section("Address", address_kv)
        if sec: sections.append(sec)

    # NO FALLBACK TO UNSTRUCTURED TEXT AS A TABLE!
    # All unstructured data is gracefully ignored per strict requirements.

    return {
        "success": True,
        "document": {
            "type": doc_type,
            "module": module_name,
            "isRelated": is_related,
            "isStructured": len(sections) > 0,
            "tableDetected": len(sections) > 0,
            "confidence": round(base_class_conf, 4),
            "pageCount": len(set(e.get("page", 1) for e in elements)) if elements else 1,
            "details": doc_info
        },
        "sections": sections,
        "tables": sections,
        "rawText": "",
        "vendor": None,
        "invoice": None,
        "totals": None
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
        _KV_COLON = re.compile(r'^(?P<key>[^:]+):\s*(?P<val>.*)$')
        m = _KV_COLON.match(text)
        if m:
            key = m.group("key").strip()
            val = m.group("val").strip()
            if len(key) >= 2 and len(val) >= 1:
                kv_pairs[key] = val

    if kv_pairs:
        pass # KV section will be added at the end

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
                "type": "table",
                "headers": columns,
                "rows": rows
            })
            
    if kv_pairs:
        kv_sec = _build_kv_section("Document Details", kv_pairs)
        if kv_sec:
            sections.insert(0, kv_sec)
            
    if not sections and raw_lines:
        sections.append({
            "title": "Extracted Content",
            "type": "table",
            "headers": ["Content"],
            "rows": [[line] for line in raw_lines if line.strip()]
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
            "tableDetected": any(s.get("type") == "table" for s in sections),
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
