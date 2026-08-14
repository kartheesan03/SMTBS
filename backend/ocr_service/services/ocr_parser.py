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

def group_into_lines(elements: List[Dict], y_tolerance: int = 15) -> List[List[Dict]]:
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
                current_y = sum((e['y0'] + e['y1']) / 2 for e in current_line) / len(current_line)
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
    
    item_rows = []
    for i, line in enumerate(lines):
        nums = []
        for el in line:
            n = parse_number(el['text'])
            if n is not None:
                if re.search(r'\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4}', el['text']):
                    continue
                nums.append(n)
        line_text = clean_line_text(line)
        valid = is_mathematically_valid(nums, line_text)
        if valid:
            item_rows.append((i, line, valid))
            
    header_lines = lines
    actual_item_lines = []
    summary_lines = []
    footer_address_lines = []
    
    if item_rows:
        item_start_idx = item_rows[0][0]
        item_end_idx = item_rows[-1][0]
        
        header_keywords = ["QTY", "QUANTITY", "RATE", "PRICE", "S.NO", "ITEM", "AMOUNT"]
        if item_start_idx > 0:
            prev_line_text = clean_line_text(lines[item_start_idx - 1]).upper()
            if any(hk in prev_line_text for hk in header_keywords):
                item_start_idx -= 1
                
        summary_idx = item_end_idx + 1
        for i in range(item_end_idx + 1, len(lines)):
            text = clean_line_text(lines[i]).upper()
            if "TOTAL" in text or "SUBTOTAL" in text or "AMOUNT" in text or "NET PAYABLE" in text:
                summary_idx = i
                break
                
        header_lines = lines[:item_start_idx]
        actual_item_lines = lines[item_start_idx:item_end_idx + 1]
        summary_lines = lines[item_end_idx + 1:summary_idx + 1]
        footer_address_lines = lines[summary_idx + 1:]
    else:
        # Fallback if no item rows found
        pass

    def extract_item_name(line_text, q, r, a):
        item_name = line_text
        
        amount_str = str(a)
        if amount_str.endswith(".0"): amount_str = amount_str[:-2]
        item_name = re.sub(rf'\b{amount_str}(?:\.\d+)?\b', '', item_name, count=1)
        
        rate_str = str(r)
        if rate_str.endswith(".0"): rate_str = rate_str[:-2]
        item_name = re.sub(rf'\b{rate_str}(?:\.\d+)?\b', '', item_name, count=1)
        
        qty_str = str(q)
        if qty_str.endswith(".0"): qty_str = qty_str[:-2]
        item_name = re.sub(rf'\b{qty_str}\s*[xX\*]?\s*', '', item_name, count=1)
        
        item_name = re.sub(r'^[^\w]+|[^\w]+$', '', item_name).strip()
        item_name = re.sub(r'₹|Rs\.?|USD', '', item_name, flags=re.IGNORECASE).strip()
        item_name = re.sub(r'^[^\w]+|[^\w]+$', '', item_name).strip()
        return item_name

    # Process items
    receipt_items = []
    sno = 1
    for i, line, valid in item_rows:
        q, r, a = valid
        line_text = " ".join([el['text'] for el in line]).strip()
        item_name = extract_item_name(line_text, q, r, a)
        
        receipt_items.append({
            "S.No": str(sno),
            "Item": item_name,
            "Quantity": str(int(q) if q == int(q) else q),
            "Rate": f"{r:.2f}",
            "Amount": f"{a:.2f}"
        })
        sno += 1

    # Process Headers
    doc_info = {}
    for line in header_lines:
        line_text = clean_line_text(line)
        if len(header_lines) > 0 and line == header_lines[0] and not ":" in line_text:
            doc_info["Company"] = line_text
            continue
        k, v = extract_generic_kv(line)
        if k and v:
            doc_info[k.title()] = v

    # Process Summary
    summary_kv = {}
    for line in summary_lines:
        line_text = clean_line_text(line).upper()
        if "TOTAL" in line_text or "AMOUNT" in line_text or "SUBTOTAL" in line_text:
            nums = re.findall(r'[\d,\.]+', line_text)
            if nums:
                summary_kv["Total"] = nums[-1]

    # Process Address/Footer
    address_lines_text = []
    for line in footer_address_lines:
        text = clean_line_text(line)
        if "THANK YOU" in text.upper() or "PLEASE COME" in text.upper():
            continue # Skip footer phrases
        valid_nums = [n for t in line if (n := parse_number(t.get('text', ''))) is not None]
        if text.strip() and not is_mathematically_valid(valid_nums, text):
            address_lines_text.append(text.strip())
            
    address_kv = {}
    if address_lines_text:
        address_kv["Address"] = ", ".join(address_lines_text)

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

    if receipt_items:
        headers = ["S.No", "Item", "Quantity", "Rate", "Amount"]
        rows = [[it[h] for h in headers] for it in receipt_items]
        sections.append({
            "title": "Items",
            "type": "table",
            "headers": headers,
            "rows": rows
        })

    if summary_kv:
        sec = _build_kv_section("Summary", summary_kv)
        if sec: sections.append(sec)

    if address_kv:
        sec = _build_kv_section("Address", address_kv)
        if sec: sections.append(sec)

    return {
        "success": True,
        "document": {
            "type": "General",
            "module": "General",
            "isRelated": False,
            "isStructured": len(sections) > 0,
            "tableDetected": len(sections) > 0,
            "confidence": 0.95,
            "pageCount": 1,
            "details": doc_info
        },
        "sections": sections,
        "tables": sections,
        "rawText": "",
        "vendor": None,
        "invoice": None,
        "totals": None
    }

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
