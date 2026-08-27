import re
import math
import itertools
from typing import List, Dict, Any, Tuple, Optional
import logging

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# UTILITY: Number parsing
# ---------------------------------------------------------------------------

def parse_number(text: str) -> Optional[float]:
    if not text:
        return None
    clean = re.sub(r'[^\d\.\,\-]', '', text)
    if not clean:
        return None
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
        return None

def is_mathematically_valid(nums: List[float], line_text: str = "") -> Optional[Tuple[float, float, float]]:
    if len(nums) < 2:
        return None
    if len(nums) >= 3:
        for combo in itertools.permutations(nums, 3):
            q, r, a = combo
            if q > 0 and r > 0 and a > 0 and abs(q * r - a) < 0.1:
                return (q, r, a)
    if len(nums) >= 2:
        for r, a in itertools.combinations(nums, 2):
            if r > 0 and abs(r - a) < 0.1:
                return (1.0, r, a)
    if len(nums) == 2:
        q, a = nums[0], nums[1]
        if q > a:
            q, a = a, q
        if re.search(rf'\b{int(q)}\s*[xX\*]\s+', line_text) or re.search(rf'^{int(q)}\s+', line_text):
            if q == int(q) and 0 < q < 1000 and a > 0:
                rate = a / q
                return (q, rate, a)
    return None

# ---------------------------------------------------------------------------
# LINE GROUPING
# ---------------------------------------------------------------------------

def group_into_lines(elements: List[Dict], y_tolerance: int = 10) -> List[List[Dict]]:
    """Group elements into horizontal lines with strict y-tolerance to avoid vertical bleeding."""
    elements = sorted(elements, key=lambda e: (e['y0'] + e['y1']) / 2)
    lines: List[List[Dict]] = []
    current_line: List[Dict] = []
    current_y: Optional[float] = None

    for el in elements:
        y_mid = (el['y0'] + el['y1']) / 2
        if current_y is None:
            current_y = y_mid
            current_line.append(el)
        else:
            if abs(y_mid - current_y) <= y_tolerance:
                current_line.append(el)
            else:
                lines.append(sorted(current_line, key=lambda e: e['x0']))
                current_line = [el]
                current_y = y_mid
                
    if current_line:
        lines.append(sorted(current_line, key=lambda e: e['x0']))

    return lines

# ---------------------------------------------------------------------------
# GENERIC KV PAIR EXTRACTION
# ---------------------------------------------------------------------------

def extract_generic_kv(line: List[Dict]) -> Tuple[Optional[str], Optional[str]]:
    if not line:
        return None, None
    line_text = " ".join([e["text"] for e in line]).strip()
    m = re.match(r'^([a-zA-Z\s\.]+)(?:[:\-])\s*(.*)$', line_text)
    if m:
        k = m.group(1).strip()
        v = m.group(2).strip()
        if len(k) > 1 and len(v) > 0:
            return k, v
    m = re.match(r'^([a-zA-Z\s]+)(?:[:\-])?\s*(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})$', line_text)
    if m:
        return m.group(1).strip(), m.group(2).strip()
    if len(line) >= 2:
        sorted_line = sorted(line, key=lambda x: x["x0"])
        max_gap = 0
        split_idx = 1
        for i in range(1, len(sorted_line)):
            gap = sorted_line[i]["x0"] - sorted_line[i-1]["x1"]
            if gap > max_gap:
                max_gap = gap
                split_idx = i
        if max_gap > 15:
            k = " ".join([e["text"] for e in sorted_line[:split_idx]]).strip()
            v = " ".join([e["text"] for e in sorted_line[split_idx:]]).strip()
            if len(k) > 1 and len(v) > 0 and not re.search(r'\d', k):
                return k, v
    return None, None



# ---------------------------------------------------------------------------
# REGION SEGMENTATION & EXTRACTION
# ---------------------------------------------------------------------------

def clean_line_text(line: List[Dict]) -> str:
    return " ".join([e["text"] for e in line]).strip()

def process_document(elements: List[Dict]) -> Dict:
    if not elements:
        return {"success": True, "document": {"type": "General", "isStructured": False, "tableDetected": False, "confidence": 0.0, "details": {}}, "sections": [], "tables": []}

    lines = group_into_lines(elements)
    
    # 1. Determine Document Type (Receipt vs Generic)
    is_receipt = False
    raw_text_full = "\n".join([clean_line_text(line) for line in lines]).upper()
    if "HOTEL" in raw_text_full or "RESTAURANT" in raw_text_full or "ROOM NO" in raw_text_full:
        is_receipt = True

    # 2. Extract Document Metadata / Header
    doc_info = {}
    vendor_name = None
    
    # Try to grab vendor name from the first line if it's substantial (mostly for receipts/invoices)
    if is_receipt and len(lines) > 0:
        first_line_text = clean_line_text(lines[0])
        if len(first_line_text) > 3 and not re.search(r'\d', first_line_text):
            vendor_name = first_line_text
            doc_info["Vendor"] = vendor_name
    elif not is_receipt and len(lines) > 0:
        # Just call it Title instead of Vendor
        first_line_text = clean_line_text(lines[0])
        if len(first_line_text) > 3:
            doc_info["Title"] = first_line_text

    for i, line in enumerate(lines):
        line_text = clean_line_text(line)
        # Look for Date
        m_date = re.search(r'(?:Date|Dt)[\s:-]*(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})', line_text, re.IGNORECASE)
        if m_date:
            doc_info["Date"] = m_date.group(1)
            
        # Look for alternative date format (e.g. 20-AUG-2026)
        m_date2 = re.search(r'(\d{1,2}[/\-\s]+[a-zA-Z]{3}[/\-\s]+\d{2,4})', line_text)
        if m_date2 and "Date" not in doc_info:
            doc_info["Date"] = m_date2.group(1)

        # Look for Room No
        m_room = re.search(r'(?:Room\s*No|Room)[\s:-]*(\d+)', line_text, re.IGNORECASE)
        if m_room:
            doc_info["Room No"] = m_room.group(1)
            
        # Try generic KV extraction for everything else
        k, v = extract_generic_kv(line)
        if k and v:
            if k not in doc_info:
                doc_info[k] = v

    # 3. Find Table Headers
    header_keywords = ["QTY", "QUANTITY", "RATE", "PRICE", "S.NO", "ITEM", "AMOUNT", "DESCRIPTION", "NAME", "SKU", "CATEGORY", "STOCK", "STATUS", "PART", "CODE"]
    
    best_header_idx = -1
    best_headers = []
    
    for i, line in enumerate(lines):
        line_text = clean_line_text(line).upper()
        matches = sum(1 for kw in header_keywords if re.search(rf'\b{kw}\b', line_text))
        if matches >= 2 or (matches >= 1 and len(line) >= 3):
            best_header_idx = i
            best_headers = line
            break
            
    table_rows = []
    headers = []
    end_idx = len(lines)
    summary_idx = len(lines)
    
    # DEBUG a: Log raw OCR text
    logger.info("=== DEBUG: RAW OCR TEXT ===")
    for idx, l in enumerate(lines):
        logger.info(f"Line {idx}: {clean_line_text(l).upper()}")
    logger.info("===========================")
    
    warnings = []
    
    def clean_numeric(val):
        if not val:
            return ""
        val = val.upper()
        val = val.replace('O', '0').replace('U', '0')
        val = val.replace('L', '1').replace('I', '1')
        val = val.replace('S', '5').replace('Q', '0')
        val = val.replace('(', '0').replace(')', '0')
        val = val.replace(' ', '')
        if re.match(r'^[\d\.,]+$', val):
            return val
        return ""

    if best_header_idx != -1:
        headers = [e["text"] for e in best_headers]
        col_centers = [(e["x0"] + e["x1"]) / 2 for e in best_headers]
        
        end_idx = len(lines)
        for i in range(best_header_idx + 1, len(lines)):
            line = lines[i]
            line_text = clean_line_text(line).upper()
            
            # Stop if we hit something that clearly looks like a receipt's final total (only if receipt-like)
            if is_receipt and any(k in line_text for k in ["SUBTOTAL", "TOTAL AMOUNT", "NET PAYABLE", "GRAND TOTAL"]):
                break
            
            # Also stop if we hit an entirely blank section or distinct new block (simple heuristic)
            if not line_text.strip():
                break
                
            row_data = {h: "" for h in headers}
            for el in line:
                el_center = (el["x0"] + el["x1"]) / 2
                closest_idx = 0
                min_dist = float('inf')
                for j, c in enumerate(col_centers):
                    dist = abs(el_center - c)
                    if dist < min_dist:
                        min_dist = dist
                        closest_idx = j
                
                if min_dist < 400: # relaxed
                    col_name = headers[closest_idx]
                    if row_data[col_name]:
                        row_data[col_name] += " " + el["text"]
                    else:
                        row_data[col_name] = el["text"]
            
            filled = sum(1 for v in row_data.values() if v.strip())
            if filled >= 1:
                table_rows.append(row_data)
                end_idx = i

    # DEBUG c: Log array after loop
    logger.info("=== DEBUG: ARRAY AFTER LOOP ===")
    logger.info(str(table_rows))
    logger.info("===============================")

    # Process Summary (Total)
    summary_kv = {}
    extracted_total = None
    for i in range(end_idx + 1, len(lines)):
        line_text = clean_line_text(lines[i]).upper()
        if "TOTAL" in line_text or "AMOUNT" in line_text or "SUBTOTAL" in line_text:
            nums = re.findall(r'[\d\.,]+', line_text)
            if nums:
                summary_kv["Total"] = nums[-1]
                extracted_total = parse_number(nums[-1])

    # 4. Validation Logic
    # Validate mathematical sum
    computed_sum = 0.0
    if table_rows:
        amount_col = next((h for h in headers if "AMOUNT" in h.upper() or "TOTAL" in h.upper() or "PRICE" in h.upper()), None)
        if amount_col:
            for row in table_rows:
                val = parse_number(row.get(amount_col, ""))
                if val is not None:
                    computed_sum += val
                    
        if extracted_total is not None and abs(computed_sum - extracted_total) > 0.1:
            warnings.append(f"Validation failed: Sum of line items ({computed_sum}) does not match extracted Total ({extracted_total}). Requires manual review.")
            
    # Vendor matching check
    if vendor_name and vendor_name.upper() not in raw_text_full:
        warnings.append(f"Validation failed: Vendor '{vendor_name}' not definitively found in raw text.")
    if vendor_name == "Company Inc." and not any("Company Inc." in clean_line_text(l) for l in lines):
        warnings.append("Validation failed: Mock data detected. Please review extracted fields.")
        
    sections = []
    
    def _build_kv_section(title, kv_dict):
        if not kv_dict: return None
        return {
            "title": title,
            "type": "table",
            "headers": ["Field", "Value"],
            "rows": [[k, v] for k, v in kv_dict.items()]
        }

    if doc_info:
        sec = _build_kv_section("Document Details", doc_info)
        if sec: sections.append(sec)

    if table_rows:
        headers = list(table_rows[0].keys())
        rows = [[row.get(h, "") for h in headers] for row in table_rows]
        
        # Append Total row at the bottom
        if summary_kv and "Total" in summary_kv:
            total_row = [""] * len(headers)
            if len(headers) >= 2:
                total_row[-2] = "TOTAL"
                total_row[-1] = summary_kv["Total"]
            else:
                total_row[0] = f"TOTAL: {summary_kv['Total']}"
            rows.append(total_row)
            # Clear summary_kv so it isn't added as a separate section
            summary_kv = {}
            
        sections.append({
            "title": "Line Items",
            "type": "table",
            "headers": headers,
            "rows": rows
        })

    if summary_kv:
        sec = _build_kv_section("Summary", summary_kv)
        if sec: sections.append(sec)

    avg_conf = 0.95
    if elements:
        conf_vals = [e.get("confidence", 0) for e in elements if e.get("confidence") is not None]
        if conf_vals:
            avg_conf = sum(conf_vals) / len(conf_vals)

    res = {
        "success": True,
        "document": {
            "type": "Receipt" if is_receipt else "General",
            "module": "General",
            "isRelated": False,
            "isStructured": len(sections) > 0,
            "tableDetected": len(table_rows) > 0,
            "confidence": round(avg_conf, 4),
            "pageCount": 1,
            "details": doc_info
        },
        "sections": sections,
        "tables": sections,
        "rawText": "\n".join([clean_line_text(line) for line in lines]),
        "vendor": vendor_name,
        "totals": summary_kv
    }
    
    if warnings:
        res["_warnings"] = warnings
        
    return res

def process_docx_document(file_path: str) -> Dict:
    import docx as _docx
    document = _docx.Document(file_path)
    sections: List[Dict] = []
    kv_pairs: Dict[str, str] = {}
    raw_lines = []
    for para in document.paragraphs:
        text = para.text.strip()
        if not text:
            continue
        raw_lines.append(text)
        _KV_COLON = re.compile(r'^(?P<key>[^:]+):\s*(?P<val>.*)$')
        m = _KV_COLON.match(text)
        if m:
            key = m.group("key").strip()
            val = m.group("val").strip()
            if len(key) >= 2 and len(val) >= 1:
                kv_pairs[key] = val
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
    def _build_kv_section_docx(title, kv_dict):
        if not kv_dict: return None
        return {
            "title": title,
            "type": "table",
            "headers": ["Field", "Value"],
            "rows": [[k, v] for k, v in kv_dict.items()]
        }
    if kv_pairs:
        kv_sec = _build_kv_section_docx("Document Details", kv_pairs)
        if kv_sec:
            sections.insert(0, kv_sec)
    if not sections and raw_lines:
        sections.append({
            "title": "Extracted Content",
            "type": "table",
            "headers": ["Content"],
            "rows": [[line] for line in raw_lines if line.strip()]
        })
    return {
        "success": True,
        "document": {
            "type": "DOCX",
            "module": "General",
            "isRelated": False,
            "isStructured": len(sections) > 0,
            "tableDetected": len(sections) > 0,
            "confidence": 1.0,
            "pageCount": 1,
            "details": kv_pairs
        },
        "sections": sections,
        "tables": sections,
        "rawText": "",
        "vendor": None,
        "invoice": None,
        "totals": None
    }
