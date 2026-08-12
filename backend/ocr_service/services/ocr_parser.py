import re
import math
from typing import List, Dict, Any, Tuple
import logging

logger = logging.getLogger(__name__)

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
    except:
        return 0.0


def group_into_lines(elements: List[Dict], y_tolerance: int = 15) -> List[List[Dict]]:
    elements = sorted(elements, key=lambda e: (e['y0']))
    lines = []
    current_line = []
    current_y = None

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
# STRUCTURAL GENERIC TABLE DETECTION
# ---------------------------------------------------------------------------

def _line_column_positions(line: List[Dict]) -> List[float]:
    """Return the horizontal center position of each element in a line."""
    return [(el['x0'] + el['x1']) / 2 for el in line]


def _alignment_score(header_positions: List[float], data_line: List[Dict], tolerance: float = 60.0) -> float:
    """
    What fraction of header columns have at least one data element near them?
    Returns a score between 0.0 and 1.0.
    """
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
    Structural table header detection:
    1. Line must have at least min_cols elements
    2. Elements must be horizontally spread (not all bunched together)
    3. At least one of the next data rows must align under the header columns
    """
    if len(line) < min_cols:
        return False

    positions = _line_column_positions(line)
    if len(positions) < min_cols:
        return False

    x_range = max(positions) - min(positions)
    if x_range < 80:
        return False

    # Check alignment with subsequent data rows
    data_lines = [l for l in next_lines[:5] if l]
    if not data_lines:
        return False

    best_score = max(_alignment_score(positions, dl) for dl in data_lines)
    return best_score >= 0.4


def detect_all_tables(lines: List[List[Dict]]) -> List[Tuple[List[Dict], int, int]]:
    """
    Generic structural table detection. No hardcoded column names.
    A table is a group of lines where:
      - The first line (header) has multiple elements spread horizontally
      - The following lines (data rows) have elements aligned under the header
    """
    tables = []
    current_search_start = 0
    FOOTER_MARKERS = [
        "SUBTOTAL", "SUB TOTAL", "GRAND TOTAL", "TAXABLE VALUE",
        "TOTAL AMOUNT", "NET PAYABLE", "AMOUNT IN WORDS", "IN WORDS",
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
                    # Generic deduplication — preserve exact original text
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
                logger.info(f"[detect_all_tables] Table header detected at line {i}: {[c['key'] for c in columns]}")
                break

        if table_start_idx == -1 or not columns:
            break

        # Find table end: footer markers or a line that has zero alignment
        table_end_idx = len(lines)
        header_positions = _line_column_positions(lines[table_start_idx])

        for i in range(table_start_idx + 1, len(lines)):
            line_text = " ".join([e["text"].upper() for e in lines[i]])
            if any(k in line_text for k in FOOTER_MARKERS):
                table_end_idx = i
                break
            # Also stop if we hit a run of 3 consecutive lines with 0 alignment
            # (indicates we've left the table body into free-form text)
            if i > table_start_idx + 3:
                streak = 0
                for j in range(max(table_start_idx + 1, i - 3), i + 1):
                    if _alignment_score(header_positions, lines[j]) < 0.1:
                        streak += 1
                if streak >= 3:
                    table_end_idx = i - 2
                    break

        tables.append((columns, table_start_idx, table_end_idx))
        current_search_start = table_end_idx + 1

    return tables


# Keep detect_table for backward compatibility (used nowhere critical, but safe to keep)
def detect_table(lines: List[List[Dict]]) -> Tuple[List[Dict], int, int]:
    results = detect_all_tables(lines)
    if results:
        return results[0]
    return [], -1, len(lines)


def extract_table_rows(lines: List[List[Dict]], columns: List[Dict]) -> List[Dict]:
    items = []
    empty_row: Dict[str, Any] = {col["key"]: "" for col in columns}
    col_tolerance = 60  # pixels

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
                # Accept if the element center falls within the column's span + tolerance
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
            # If first column is empty, this is likely a continuation of the previous row
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


def detect_document_class(lines: List[List[Dict]]) -> Tuple[bool, str, str, float]:
    full_text = " ".join([e["text"].upper() for line in lines for e in line])

    modules = {
        "HRMS / Attendance": {
            "keywords": ["HRMS", "ATTENDANCE", "ABSENCE", "ABSENT", "PRESENT", "EMPLOYEE",
                         "DEPARTMENT", "DESIGNATION", "AUDITOR", "HR", "LEAVE", "SHIFT"],
            "types": {
                "HR Custom Report": ["CUSTOM REPORT", "HR REPORT", "ABSENCE AUDITS", "EMPLOYEE REPORT"],
                "Attendance Register": ["ATTENDANCE REGISTER", "TIME TRACKING"],
                "Leave Application": ["LEAVE APPLICATION", "LEAVE BALANCE"]
            }
        },
        "Payroll": {
            "keywords": ["PAYROLL", "SALARY", "PAYSLIP", "DEDUCTION", "ALLOWANCE",
                         "NET SALARY", "BASIC SALARY", "OVERTIME"],
            "types": {
                "Salary Slip": ["PAYSLIP", "SALARY SLIP", "WAGE SLIP"],
                "Payroll Report": ["PAYROLL REPORT", "SALARY REPORT"]
            }
        },
        "Inventory / Material Tracking": {
            "keywords": ["INVENTORY", "STOCK", "MATERIAL", "WAREHOUSE", "SKU",
                         "AVAILABLE STOCK", "PROCUREMENT", "REGISTER", "INWARD", "OUTWARD"],
            "types": {
                "Inventory Stock Report": ["STOCK LEVELS", "STOCK REPORT", "INVENTORY REPORT",
                                           "AVAILABLE STOCK", "INVENTORY REGISTER", "MATERIAL REGISTER"],
                "Material Requisition": ["MATERIAL REQUISITION", "MATERIAL REQUEST"]
            }
        },
        "Finance / Procurement / Sales": {
            "keywords": ["INVOICE", "PURCHASE ORDER", "PO NO", "BILL TO", "GSTIN",
                         "TAX", "AMOUNT", "DELIVERY CHALLAN", "QUOTATION", "EXPENSE", "RECEIPT"],
            "types": {
                "Invoice": ["INVOICE", "TAX INVOICE", "BILL"],
                "Purchase Order": ["PURCHASE ORDER", "PO NUMBER"],
                "Delivery Challan": ["DELIVERY CHALLAN", "CHALLAN"],
                "Quotation": ["QUOTATION", "ESTIMATE"],
                "Expense Bill": ["EXPENSE", "REIMBURSEMENT", "RECEIPT"]
            }
        },
        "CRM / Leads": {
            "keywords": ["CRM", "LEADS", "CUSTOMER", "PIPELINE", "SALES GOALS", "CONTACT"],
            "types": {"CRM Report": ["CRM REPORT", "LEADS REPORT", "SALES PIPELINE"]}
        },
        "Tasks & Projects": {
            "keywords": ["PROJECT", "TASK", "DEADLINE", "MILESTONE", "PROJECT MANAGER"],
            "types": {"Project Report": ["PROJECT REPORT", "TASK LIST", "SPRINT"]}
        }
    }

    best_module = "General"
    best_doc_type = "General Document"
    max_score = 0

    for mod_name, mod_data in modules.items():
        score = sum(1 for kw in mod_data["keywords"] if kw in full_text)
        type_score = 0
        current_type = "Document"
        for t_name, t_keywords in mod_data["types"].items():
            t_s = sum(2 for kw in t_keywords if kw in full_text)
            if t_s > type_score:
                type_score = t_s
                current_type = t_name

        total_score = score + type_score
        if total_score > max_score:
            max_score = total_score
            best_module = mod_name
            best_doc_type = current_type if type_score > 0 else f"{mod_name} Document"

    if max_score > 0:
        base_confidence = min(0.99, 0.5 + (max_score * 0.1))
        return True, best_module, best_doc_type, base_confidence

    return False, "General", "General Document", 1.0


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


def extract_metadata(lines: List[List[Dict]]) -> tuple:
    details = {}
    cleaned_lines = []

    KNOWN_KEYS = [
        "Invoice No.", "Invoice Date", "Invoice Number", "Bill No.", "Bill Date",
        "Token No.", "Token No", "Patient Name", "Pt Name", "Department", "Print Time",
        "Contact", "GSTIN", "PO Number", "Purchase Order", "Date", "Phone", "Email"
    ]

    SECTION_HEADERS = [
        "BILLING DETAILS", "PARTICULAR CHARGES", "PARTICULARS",
        "DESCRIPTION", "AMOUNT", "SL NO", "S.NO", "ITEM NAME"
    ]

    KV_PATTERN = re.compile(r'^(?P<key>[A-Za-z\s\.]+)\s*[:\-]\s*(?P<val>.+)$')

    for line in lines:
        line_text = " ".join([e["text"] for e in line]).strip()
        if not line_text:
            continue

        line_text_upper = line_text.upper()

        if any(
            line_text_upper.strip() == h.upper() or line_text_upper.strip() == h.upper() + "S"
            for h in SECTION_HEADERS
        ) or ("PARTICULAR" in line_text_upper and "CHARGE" in line_text_upper):
            continue

        is_metadata = False

        m = KV_PATTERN.match(line_text)
        if m:
            d_key = m.group("key").strip()
            d_val = m.group("val").strip()
            if any(k.lower() == d_key.lower() for k in KNOWN_KEYS):
                std_key = next(k for k in KNOWN_KEYS if k.lower() == d_key.lower())
                details[std_key] = d_val
                is_metadata = True

        if not is_metadata:
            gstin_match = re.search(
                r'\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}\b', line_text_upper
            )
            if gstin_match and "GSTIN" not in details:
                details["GSTIN"] = gstin_match.group(0)
                is_metadata = True
            elif re.search(r'^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$', line_text) and "Date" not in details:
                details["Date"] = line_text
                is_metadata = True

        if not is_metadata and len(cleaned_lines) < 3 and len(line_text) > 3:
            if "HOSPITAL" in line_text_upper or "CLINIC" in line_text_upper:
                details["Hospital"] = re.sub(r'^For\s+', '', line_text, flags=re.IGNORECASE).strip()
                is_metadata = True
            elif "LTD" in line_text_upper or "PVT" in line_text_upper or "INC" in line_text_upper:
                details["Vendor Name"] = re.sub(r'^For\s+', '', line_text, flags=re.IGNORECASE).strip()
                is_metadata = True

        if not is_metadata:
            cleaned_lines.append(line)

    return details, cleaned_lines


def extract_totals(lines: List[List[Dict]]) -> Dict:
    totals = {"subtotal": 0.0, "cgst": 0.0, "sgst": 0.0, "igst": 0.0, "discount": 0.0, "grand_total": 0.0}
    for line in lines:
        line_text = " ".join([e["text"].upper() for e in line])
        nums = [parse_number(e["text"]) for e in line if re.search(r'\d', e["text"])]
        if not nums:
            continue
        last_num = nums[-1]
        if "SUBTOTAL" in line_text or "SUB TOTAL" in line_text or "TAXABLE" in line_text:
            totals["subtotal"] = last_num
        elif "CGST" in line_text:
            totals["cgst"] = last_num
        elif "SGST" in line_text:
            totals["sgst"] = last_num
        elif "IGST" in line_text:
            totals["igst"] = last_num
        elif "DISCOUNT" in line_text:
            totals["discount"] = last_num
        elif "GRAND TOTAL" in line_text or "NET AMOUNT" in line_text or "TOTAL AMOUNT" in line_text:
            totals["grand_total"] = last_num
    return totals


def extract_payroll_totals(lines: List[List[Dict]]) -> Dict:
    totals = {"net_payable": 0.0, "amount_in_words": ""}
    for line in lines:
        line_text = " ".join([e["text"] for e in line])
        line_text_upper = line_text.upper()
        if "NET PAYABLE" in line_text_upper:
            nums = [parse_number(e["text"]) for e in line if re.search(r'\d', e["text"])]
            if nums:
                totals["net_payable"] = nums[-1]
        if "IN WORDS" in line_text_upper:
            match = re.search(r'IN WORDS.*?(?:RUPEES?|INR)?\s*([A-Za-z\s]+ONLY)', line_text_upper, re.IGNORECASE)
            if match:
                totals["amount_in_words"] = match.group(1).strip().title()
            else:
                idx = line_text_upper.find("IN WORDS")
                words_part = line_text[idx + 8:].strip()
                words_part = re.sub(r'^[^\w]+', '', words_part)
                totals["amount_in_words"] = words_part
    return totals


def extract_kv_table(lines: List[List[Dict]]) -> Dict:
    """
    Generic key-value fallback. Returns Field | Value structure.
    Never forces 'Particular | Amount' — only uses that if all values look numeric.
    """
    kv_rows = []
    row_number = 1
    all_values_numeric = True

    KV_PATTERN = re.compile(r'^(?P<key>[^:\-\t]{2,60}?)\s*[:\-]\s*(?P<val>.+)$')
    SPACE_NUM_PATTERN = re.compile(
        r'^(?P<key>[A-Za-z\s\/\(\)\&\.]{3,60}?)\s+(?P<val>(?:Rs\.?|INR|₹)?\s*\d[\d\,\.]*)$',
        re.IGNORECASE
    )

    for line in lines:
        if not line:
            continue

        line_text = " ".join(el["text"] for el in line).strip()
        if not line_text:
            continue

        m = KV_PATTERN.match(line_text) or SPACE_NUM_PATTERN.match(line_text)
        if m:
            key = m.group("key").strip().title()
            val = m.group("val").strip()
            if len(key) >= 2:
                conf = sum(el.get("confidence", 1.0) for el in line) / len(line)
                kv_rows.append({
                    "row_number": row_number,
                    "Field": key,
                    "Value": val,
                    "confidence": round(conf, 4)
                })
                row_number += 1
                # Check if this value is NOT numeric
                if not re.match(r'^(?:Rs\.?|INR|₹)?\s*[\d,\.]+$', val, re.IGNORECASE):
                    all_values_numeric = False

    # Only rename to Particular/Amount if ALL values look like currency amounts
    if all_values_numeric and kv_rows:
        cols = ["Particular", "Amount"]
        for row in kv_rows:
            row["Particular"] = row.pop("Field")
            row["Amount"] = row.pop("Value")
    else:
        cols = ["Field", "Value"]
        all_values_numeric = False

    return {
        "columns": cols,
        "rows": kv_rows,
        "notes": [],
        "details": {}
    }


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
            "tables": [{
                "title": "Extracted Data",
                "columns": ["Field", "Value"],
                "rows": [{"row_number": 1, "Field": "", "Value": "", "confidence": 0.0}],
                "notes": []
            }],
            "rawText": "",
            "vendor": None,
            "invoice": None,
            "totals": None
        }

    lines = group_into_lines(elements)

    # 1. Extract document details globally
    doc_details, lines = extract_metadata(lines)

    # 2. Classify document
    is_related, module_name, doc_type, base_class_conf = detect_document_class(lines)
    raw_text = extract_unstructured_text(lines)

    # 3. Detect ALL formal tables using structural detection
    detected_tables = detect_all_tables(lines)

    is_structured = len(detected_tables) > 0
    table_detected = is_structured
    tables = []
    end_idx = len(lines)

    if is_structured:
        for idx, (columns, t_start_idx, t_end_idx) in enumerate(detected_tables):
            table_lines = lines[t_start_idx + 1:t_end_idx]
            items = extract_table_rows(table_lines, columns)
            title = f"Extracted Table {idx + 1}" if len(detected_tables) > 1 else "Extracted Table"
            tables.append({
                "title": title,
                "columns": [col["key"] for col in columns],
                "rows": items
            })
        end_idx = detected_tables[-1][2]
    else:
        # Fallback: generic key-value table
        kv = extract_kv_table(lines)
        if kv["rows"]:
            is_structured = True
            tables.append({
                "title": "Extracted Data",
                "columns": kv["columns"],
                "rows": kv["rows"],
                "notes": kv["notes"]
            })
        if kv.get("details"):
            doc_details.update(kv["details"])

    # Calculate confidence
    all_char_conf = [e["confidence"] for e in elements if "confidence" in e]
    char_conf = sum(all_char_conf) / len(all_char_conf) if all_char_conf else 1.0
    all_pages = set(e.get("page", 1) for e in elements)
    page_count = len(all_pages) if all_pages else 1
    final_confidence = (base_class_conf + char_conf) / 2 if is_related else char_conf

    footer_lines = lines[end_idx:] if end_idx < len(lines) else lines[-15:]
    totals = None
    if module_name == "Finance / Procurement / Sales":
        totals = extract_totals(footer_lines)
    elif module_name == "Payroll":
        totals = extract_payroll_totals(footer_lines)

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
            "details": doc_details
        },
        "tables": tables,
        "rawText": raw_text,
        "vendor": {
            "name": doc_details.get("Vendor Name"),
            "gstin": doc_details.get("GSTIN")
        } if doc_details.get("Vendor Name") or doc_details.get("GSTIN") else None,
        "invoice": {
            "number": doc_details.get("Invoice No.") or doc_details.get("Invoice Number") or doc_details.get("Bill No."),
            "date": doc_details.get("Invoice Date") or doc_details.get("Date") or doc_details.get("Bill Date"),
            "po_number": doc_details.get("PO Number") or doc_details.get("Purchase Order")
        } if any(doc_details.get(k) for k in ["Invoice No.", "Invoice Number", "Bill No."]) else None,
        "totals": totals
    }
