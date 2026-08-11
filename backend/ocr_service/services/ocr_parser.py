import re
import math
from typing import List, Dict, Any, Tuple

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


def detect_all_tables(lines: List[List[Dict]]) -> List[Tuple[List[Dict], int, int]]:
    header_indicators = [
        "NAME", "ITEM", "DESCRIPTION", "PRODUCT", "PARTICULARS", "SKU", "CODE", 
        "CATEGORY", "STOCK", "STATUS", "QTY", "QUANTITY", "NO.", "UNIT", "UOM",
        "RATE", "PRICE", "AMOUNT", "TOTAL", "TAX", "GST", "DISCOUNT", "HSN", "VALUE",
        "EMPLOYEE", "DEPARTMENT", "ATTENDANCE", "LEAVE", "START DATE", "END DATE",
        "DAYS", "BASIC SALARY", "ALLOWANCES", "DEDUCTIONS", "NET SALARY", "CUSTOMER",
        "LEAD", "COMPANY", "CONTACT", "SOURCE", "VENDOR", "PROJECT", "TASK", "DEADLINE",
        "REPORT CATEGORY", "FORMAT", "DATE RANGE", "SIGNATURE"
    ]
    
    tables = []
    current_search_start = 0
    
    while current_search_start < len(lines):
        table_start_idx = -1
        columns = []
        
        for i in range(current_search_start, len(lines)):
            line = lines[i]
            match_count = 0
            for el in line:
                el_text = el["text"].upper()
                if any(kw in el_text for kw in header_indicators):
                    match_count += 1
                    
            if match_count >= 2 and len(line) >= 2:
                table_start_idx = i
                seen_keys = {}
                for el in line:
                    key = el["text"].strip()
                    key_upper = key.upper()
                    if key_upper in ["START", "END"]:
                        continue
                    if "DATE RANGE" in key_upper:
                        if "DATE RANGE" not in seen_keys:
                            key = "Start Date"
                            seen_keys["DATE RANGE"] = 1
                        else:
                            key = "End Date"
                    elif "PAY HEAD" in key_upper:
                        if "PAY HEAD" not in seen_keys:
                            seen_keys["PAY HEAD"] = 1
                            key = "Pay Head"
                        else:
                            key = "Deduction Head"
                    elif "AMOUNT" in key_upper:
                        if "AMOUNT" not in seen_keys:
                            seen_keys["AMOUNT"] = 1
                            key = "Amount (Rs.)"
                        else:
                            key = "Deduction Amount (Rs.)"
                    else:
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
                break
                
        if table_start_idx == -1:
            break
            
        table_end_idx = len(lines)
        for i in range(table_start_idx + 1, len(lines)):
            line_text = " ".join([e["text"].upper() for e in lines[i]])
            if any(k in line_text for k in ["SUBTOTAL", "SUB TOTAL", "GRAND TOTAL", "TAXABLE", "TOTAL AMOUNT", "NET PAYABLE", "IN WORDS"]):
                table_end_idx = i
                break
                
        tables.append((columns, table_start_idx, table_end_idx))
        current_search_start = table_end_idx
        
    return tables

def detect_table(lines: List[List[Dict]]) -> Tuple[List[Dict], int, int]:
    header_indicators = [
        "NAME", "ITEM", "DESCRIPTION", "PRODUCT", "PARTICULARS", "SKU", "CODE", 
        "CATEGORY", "STOCK", "STATUS", "QTY", "QUANTITY", "NO.", "UNIT", "UOM",
        "RATE", "PRICE", "AMOUNT", "TOTAL", "TAX", "GST", "DISCOUNT", "HSN", "VALUE",
        "EMPLOYEE", "DEPARTMENT", "ATTENDANCE", "LEAVE", "START DATE", "END DATE",
        "DAYS", "BASIC SALARY", "ALLOWANCES", "DEDUCTIONS", "NET SALARY", "CUSTOMER",
        "LEAD", "COMPANY", "CONTACT", "SOURCE", "VENDOR", "PROJECT", "TASK", "DEADLINE",
        "REPORT CATEGORY", "FORMAT", "DATE RANGE", "SIGNATURE"
    ]
    
    table_start_idx = -1
    columns = []
    
    for i, line in enumerate(lines):
        match_count = 0
        for el in line:
            el_text = el["text"].upper()
            if any(kw in el_text for kw in header_indicators):
                match_count += 1
                
        # A row with at least 2 distinct header elements is highly likely our table header
        if match_count >= 2 and len(line) >= 2:
            table_start_idx = i
            seen_keys = {}
            # DEBUG: log raw header texts
            import logging as _log
            _log.getLogger(__name__).info(f"[detect_table] Header row raw texts: {[el['text'] for el in line]}")
            for el in line:
                key = el["text"].strip()
                key_upper = key.upper()
                
                # Skip stray START/END that belong to DATE RANGE
                if key_upper in ["START", "END"]:
                    continue
                    
                # Special disambiguation for HR report
                if "DATE RANGE" in key_upper:
                    if "DATE RANGE" not in seen_keys:
                        key = "Start Date"
                        seen_keys["DATE RANGE"] = 1
                    else:
                        key = "End Date"
                
                # Handling duplicated Pay Head for Salary Breakup
                elif "PAY HEAD" in key_upper:
                    if "PAY HEAD" not in seen_keys:
                        seen_keys["PAY HEAD"] = 1
                        key = "Pay Head"
                    else:
                        key = "Deduction Head"
                        
                elif "AMOUNT" in key_upper:
                    if "AMOUNT" not in seen_keys:
                        seen_keys["AMOUNT"] = 1
                        key = "Amount (Rs.)"
                    else:
                        key = "Deduction Amount (Rs.)"
                
                else:
                    # General deduplication for other columns
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
            break
            
    table_end_idx = len(lines)
    if table_start_idx != -1:
        for i in range(table_start_idx + 1, len(lines)):
            line_text = " ".join([e["text"].upper() for e in line])
            if any(k in line_text for k in ["SUBTOTAL", "SUB TOTAL", "GRAND TOTAL", "TAXABLE", "TOTAL AMOUNT", "NET PAYABLE", "IN WORDS"]):
                table_end_idx = i
                break
                
    return columns, table_start_idx, table_end_idx

def extract_table_rows(lines: List[List[Dict]], columns: List[Dict]) -> List[Dict]:
    items = []
    empty_row: Dict[str, Any] = {col["key"]: "" for col in columns}
    
    for line in lines:
        if not line: continue
        
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
                if col['x0'] - 50 <= el_mid <= col['x1'] + 50:
                    if dist < best_dist:
                        best_dist = dist
                        best_col = col
                        
            if best_col:
                col_key = best_col["key"]
                text = el["text"]
                confidences.append(el["confidence"])
                is_empty_row = False
                
                if row_data[col_key]:
                    row_data[col_key] += " " + text
                else:
                    row_data[col_key] = text
                    
        if not is_empty_row:
            row_data["confidence"] = sum(confidences) / len(confidences) if confidences else 1.0
            
            # Post-process: split merged dates if Start Date caught both
            if "Start Date" in row_data and "End Date" in row_data:
                start_val = row_data.get("Start Date", "").strip()
                if start_val and not row_data.get("End Date", "").strip():
                    dates = re.findall(r'\d{4}[-/]\d{2}[-/]\d{2}', start_val)
                    if len(dates) >= 2:
                        row_data["Start Date"] = dates[0]
                        row_data["End Date"] = dates[1]
                        
            first_col_key = columns[0]["key"]
            if not row_data[first_col_key] and items:
                for k, v in row_data.items():
                    if k != "confidence" and v:
                        items[-1][k] += " " + v
            else:
                items.append(row_data)
                
    valid_items = []
    for i, it in enumerate(items):
        has_data = any(bool(it[col["key"]].strip()) for col in columns)
        if has_data:
            it["row_number"] = len(valid_items) + 1
            valid_items.append(it)
            
    return valid_items

def detect_document_class(lines: List[List[Dict]]) -> Tuple[bool, str, str, float]:
    """
    Returns (is_related, module, document_type, confidence)
    """
    full_text = " ".join([e["text"].upper() for line in lines for e in line])
    
    modules = {
        "HRMS / Attendance": {
            "keywords": ["HRMS", "ATTENDANCE", "ABSENCE", "ABSENT", "PRESENT", "EMPLOYEE", "DEPARTMENT", "DESIGNATION", "AUDITOR", "HR", "LEAVE", "SHIFT"],
            "types": {
                "HR Custom Report": ["CUSTOM REPORT", "HR REPORT", "ABSENCE AUDITS", "EMPLOYEE REPORT"],
                "Attendance Register": ["ATTENDANCE REGISTER", "TIME TRACKING"],
                "Leave Application": ["LEAVE APPLICATION", "LEAVE BALANCE"]
            }
        },
        "Payroll": {
            "keywords": ["PAYROLL", "SALARY", "PAYSLIP", "DEDUCTION", "ALLOWANCE", "NET SALARY", "BASIC SALARY", "OVERTIME"],
            "types": {
                "Salary Slip": ["PAYSLIP", "SALARY SLIP", "WAGE SLIP"],
                "Payroll Report": ["PAYROLL REPORT", "SALARY REPORT"]
            }
        },
        "Inventory / Material Tracking": {
            "keywords": ["INVENTORY", "STOCK", "MATERIAL", "WAREHOUSE", "SKU", "AVAILABLE STOCK", "PROCUREMENT"],
            "types": {
                "Inventory Stock Report": ["STOCK LEVELS", "STOCK REPORT", "INVENTORY REPORT", "AVAILABLE STOCK"],
                "Material Requisition": ["MATERIAL REQUISITION", "MATERIAL REQUEST"]
            }
        },
        "Finance / Procurement / Sales": {
            "keywords": ["INVOICE", "PURCHASE ORDER", "PO NO", "BILL TO", "GSTIN", "TAX", "AMOUNT", "DELIVERY CHALLAN", "QUOTATION", "EXPENSE", "RECEIPT"],
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
            "types": {
                "CRM Report": ["CRM REPORT", "LEADS REPORT", "SALES PIPELINE"]
            }
        },
        "Tasks & Projects": {
            "keywords": ["PROJECT", "TASK", "DEADLINE", "MILESTONE", "PROJECT MANAGER"],
            "types": {
                "Project Report": ["PROJECT REPORT", "TASK LIST", "SPRINT"]
            }
        }
    }
    
    best_module = "General"
    best_doc_type = "General Document"
    max_score = 0
    
    for mod_name, mod_data in modules.items():
        score = sum(1 for kw in mod_data["keywords"] if kw in full_text)
        
        # Check sub-types
        type_score = 0
        current_type = "Document"
        for t_name, t_keywords in mod_data["types"].items():
            t_s = sum(2 for kw in t_keywords if kw in full_text) # Weight exact document types heavily
            if t_s > type_score:
                type_score = t_s
                current_type = t_name
                
        total_score = score + type_score
        if total_score > max_score:
            max_score = total_score
            best_module = mod_name
            if type_score > 0:
                best_doc_type = current_type
            else:
                best_doc_type = f"{mod_name} Document"
                
    # Confidence calculation:
    # A score of >= 4 means highly confident. We normalize it to a 0.5 - 0.99 range.
    if max_score > 0:
        base_confidence = min(0.99, 0.5 + (max_score * 0.1))
        return True, best_module, best_doc_type, base_confidence
        
    return False, "General", "General Document", 1.0

def extract_unstructured_text(lines: List[List[Dict]]) -> str:
    text_blocks = []
    current_page = None
    
    for line in lines:
        if not line: continue
        page = line[0].get("page", 1)
        if current_page != page:
            if current_page is not None:
                text_blocks.append(f"\n--- PAGE {page} ---\n")
            current_page = page
            
        line_text = " ".join(e["text"] for e in line)
        text_blocks.append(line_text)
        
    return "\n".join(text_blocks).strip()

def extract_metadata(lines: List[List[Dict]]) -> tuple[Dict, List[List[Dict]]]:
    """
    Universally parse standard metadata keys from anywhere in the document.
    Returns (details_dict, remaining_lines).
    """
    import re
    details = {}
    cleaned_lines = []
    
    # Common keys we look for globally
    KNOWN_KEYS = [
        "Invoice No.", "Invoice Date", "Invoice Number", "Bill No.", "Bill Date",
        "Token No.", "Token No", "Patient Name", "Pt Name", "Department", "Print Time", "Contact",
        "GSTIN", "PO Number", "Purchase Order", "Date", "Phone", "Email"
    ]
    
    # Keys that identify section headers to discard entirely
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
        
        # Discard section headers
        if any(line_text_upper.strip() == h.upper() or line_text_upper.strip() == h.upper() + "S" for h in SECTION_HEADERS) or "PARTICULAR" in line_text_upper and "CHARGE" in line_text_upper:
            continue
            
        is_metadata = False
        
        # 1. Look for explicit KV pairs matching our known keys
        m = KV_PATTERN.match(line_text)
        if m:
            d_key = m.group("key").strip()
            d_val = m.group("val").strip()
            
            if any(k.lower() == d_key.lower() for k in KNOWN_KEYS):
                std_key = next(k for k in KNOWN_KEYS if k.lower() == d_key.lower())
                details[std_key] = d_val
                is_metadata = True
        
        # 2. Look for implicit patterns if not explicitly caught
        if not is_metadata:
            # GSTIN
            gstin_match = re.search(r'\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}\b', line_text_upper)
            if gstin_match and "GSTIN" not in details:
                details["GSTIN"] = gstin_match.group(0)
                is_metadata = True
                
            # Date (if no label)
            elif re.search(r'^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$', line_text) and "Date" not in details:
                details["Date"] = line_text
                is_metadata = True
                
            # Squashed multiple metadata fields on one line (e.g., "Bill No 792 Pt Name Mrs. Test Test Date 28/10/2023")
            else:
                found_any_key = False
                # Try to extract fields by searching for known keywords
                # Sort known keys by length descending to match longest first
                sorted_keys = sorted(KNOWN_KEYS, key=len, reverse=True)
                
                temp_text = line_text
                for k in sorted_keys:
                    # Find key in text
                    idx = temp_text.upper().find(k.upper())
                    if idx != -1:
                        # We found a keyword, try to extract its value (text until next keyword or end of string)
                        val_start = idx + len(k)
                        # Strip colons or hyphens right after the key
                        while val_start < len(temp_text) and temp_text[val_start] in [' ', ':', '-']:
                            val_start += 1
                            
                        # Find the next keyword's start position to bound the value
                        next_idx = len(temp_text)
                        for other_k in sorted_keys:
                            if other_k.upper() == k.upper(): continue
                            other_idx = temp_text.upper().find(other_k.upper(), val_start)
                            if other_idx != -1 and other_idx < next_idx:
                                next_idx = other_idx
                                
                        val = temp_text[val_start:next_idx].strip().strip(':-. ')
                        if val:
                            std_key = k
                            if k.upper() == "PT NAME": std_key = "Patient Name"
                            if k.upper() == "TOKEN NO": std_key = "Token No."
                            details[std_key] = val
                            found_any_key = True
                            
                if found_any_key:
                    is_metadata = True
        
        # 3. Hospital/Vendor Name fallback (first few lines)
        if not is_metadata and len(cleaned_lines) < 3 and len(line_text) > 3 and "Vendor Name" not in details:
            if "HOSPITAL" in line_text_upper or "CLINIC" in line_text_upper:
                name = re.sub(r'^For\s+', '', line_text, flags=re.IGNORECASE).strip()
                details["Hospital"] = name
                is_metadata = True
            elif "LTD" in line_text_upper or "PVT" in line_text_upper or "INC" in line_text_upper:
                name = re.sub(r'^For\s+', '', line_text, flags=re.IGNORECASE).strip()
                details["Vendor Name"] = name
                is_metadata = True
                
        # 4. Department
        if not is_metadata:
            for dept_kw in ["DEPARTMENT", "DEPARTMERT"]:
                if dept_kw in line_text_upper:
                    val = line_text_upper.replace(dept_kw, "").strip().strip(':-. ')
                    if val:
                        details["Department"] = val.title()
                        is_metadata = True
                        break

        if not is_metadata:
            cleaned_lines.append(line)
            
    return details, cleaned_lines

def extract_totals(lines: List[List[Dict]]) -> Dict:
    totals = {
        "subtotal": 0.0,
        "cgst": 0.0,
        "sgst": 0.0,
        "igst": 0.0,
        "discount": 0.0,
        "grand_total": 0.0
    }
    for line in lines:
        line_text = " ".join([e["text"].upper() for e in line])
        nums = [parse_number(e["text"]) for e in line if re.search(r'\d', e["text"])]
        if not nums: continue
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
        elif "GRAND TOTAL" in line_text or "NET AMOUNT" in line_text or "TOTAL AMOUNT" in line_text or "BALANCE" in line_text:
            totals["grand_total"] = last_num
    return totals

def extract_payroll_totals(lines: List[List[Dict]]) -> Dict:
    totals = {
        "net_payable": 0.0,
        "amount_in_words": ""
    }
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
                words_part = line_text[idx+8:].strip()
                words_part = re.sub(r'^[^\w]+', '', words_part)
                totals["amount_in_words"] = words_part
                
    return totals

def extract_kv_table(lines: List[List[Dict]]) -> Dict:
    """
    When no formal table structure is found, attempt to parse key–value pairs
    from the extracted text lines (e.g. "Total Employees: 5").
    Returns a dict with 'columns', 'rows', and 'notes' (unparseable lines).
    """
    import re as _re
    kv_rows = []
    notes_lines = []
    
    # Separators we'll recognise: colon, dash, tab, or 2+ spaces
    KV_PATTERN = _re.compile(
        r'^(?P<key>[^:\-\t]{2,60}?)\s*[:\-]\s*(?P<val>.+)$'
    )
    # Fallback for borderless receipts: label followed by a numeric value
    SPACE_NUM_PATTERN = _re.compile(
        r'^(?P<key>[A-Za-z\s\/\(\)\&\.]{3,60}?)\s+(?P<val>(?:Rs\.?|INR|₹)?\s*\d[\d\,\.]*)$', _re.IGNORECASE
    )
    
    row_number = 1
    has_amount_val = False
    
    for line in lines:
        if not line:
            continue
            
        # Check if we have multiple labels and amounts squeezed together
        texts = []
        nums = []
        for el in line:
            t = el["text"].strip()
            if _re.match(r'^(?:Rs\.?|INR|₹)?\s*\d+[\d\,\.]*$', t, _re.IGNORECASE):
                nums.append(t)
            else:
                texts.append(t)
                
        # Handle squashed label-number combinations
        if len(nums) >= 1 and len(texts) >= 1:
            full_text = " ".join(texts)
            words = full_text.split()
            if len(words) >= len(nums) and len(words) % len(nums) == 0:
                words_per_num = len(words) // len(nums)
                split_texts = [" ".join(words[i:i+words_per_num]) for i in range(0, len(words), words_per_num)]
                if len(split_texts) == len(nums):
                    for i in range(len(nums)):
                        kv_rows.append({
                            "row_number": row_number,
                            "Metric": split_texts[i].strip().title(),
                            "Value": nums[i].strip(),
                            "confidence": 0.95
                        })
                        row_number += 1
                    has_amount_val = True
                    continue
            
        # Concatenate the line for standard fallback processing
        line_text = " ".join(el["text"] for el in line).strip()
        if not line_text:
            continue
            
        # Skip obvious header/title lines (all caps, very short, or no separator)
        m = KV_PATTERN.match(line_text) or SPACE_NUM_PATTERN.match(line_text)
        if m:
            key = m.group("key").strip().title()
            val = m.group("val").strip()
            
            # Check if this is an amount row for our receipt pattern
            if SPACE_NUM_PATTERN.match(line_text):
                has_amount_val = True
                
            # Skip if the key looks like a standalone header word
            if len(key) >= 2 and len(key) <= 60:
                conf = sum(el.get("confidence", 1.0) for el in line) / len(line)
                kv_rows.append({
                    "row_number": row_number,
                    "Metric": key,
                    "Value": val,
                    "confidence": round(conf, 4)
                })
                row_number += 1
                continue
        
        # Lines that don't match get collected as notes
        notes_lines.append(line_text)
    
    # Deduplicate notes: skip lines that are already captured as Metric text
    captured_keys = {r["Metric"].lower() for r in kv_rows}
    notes = [l for l in notes_lines if l.lower() not in captured_keys and len(l) > 2]
    
    details = {}
    remaining_notes = []
    DETAIL_PATTERN = _re.compile(r'^(?P<key>[A-Za-z\s]+)\s*[:\-]\s*(?P<val>.+)$')
    
    # Common prefixes found in receipts without explicit colons
    RECEIPT_KEYS = [
        "Token No.", "Bill No.", "Patient Name", "Bill Date", 
        "Date", "Department", "Print Time", "Contact"
    ]
    
    for note in notes:
        # Check standard Key: Value pattern
        m = DETAIL_PATTERN.match(note)
        if m:
            d_key = m.group("key").strip().title()
            d_val = m.group("val").strip()
            if len(d_key) > 2 and len(d_val) > 0:
                details[d_key] = d_val
                continue
        
        # Check specific receipt keys without colons
        matched_prefix = False
        for k in RECEIPT_KEYS:
            if note.lower().startswith(k.lower()):
                val = note[len(k):].strip().strip(':-. ')
                if val:
                    details[k] = val
                    matched_prefix = True
                    break
        if matched_prefix:
            continue
            
        # Catch Hospital Names
        if "hospital" in note.lower():
            details["Hospital"] = note.strip()
            continue
            
        # Look for implicit details like Date if we don't have one
        if _re.search(r'\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}', note) and "Date" not in details:
            details["Date"] = note
            continue
            
        remaining_notes.append(note)

    # Check if we should rename columns for Receipt
    cols = ["Metric", "Value"]
    if has_amount_val:
        cols = ["Particular", "Amount"]
        for row in kv_rows:
            row["Particular"] = row.pop("Metric")
            row["Amount"] = row.pop("Value")

    # Force creation of a table if we have absolutely nothing structured
    # Actually, user wants EVERYTHING in table format, no "Additional Notes" at all!
    for note in remaining_notes:
        kv_rows.append({
            "row_number": row_number,
            cols[0]: note,
            cols[1]: "",
            "confidence": 0.5
        })
        row_number += 1
        
    final_notes = []
    
    return {
        "columns": cols,
        "rows": kv_rows,
        "notes": final_notes,
        "details": details
    }


def process_document(elements: List[Dict]) -> Dict:
    if not elements:
        # User requested that ANY document always yields an editable table.
        # If no text is detected (e.g. poor image quality, or blank image),
        # return a blank table structure so the user can manually type the data.
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
                "columns": ["Particular", "Amount"],
                "rows": [{
                    "row_number": 1,
                    "Particular": "",
                    "Amount": "",
                    "confidence": 0.0
                }],
                "notes": []
            }],
            "rawText": "",
            "vendor": None,
            "invoice": None,
            "totals": None
        }
        
    lines = group_into_lines(elements)
    
    # 1. Extract document details globally before anything else
    doc_details, lines = extract_metadata(lines)
    
    # 2. Proceed with document classification on the cleaned lines
    is_related, module_name, doc_type, base_class_conf = detect_document_class(lines)
    raw_text = extract_unstructured_text(lines)
    
    # 3. Detect ALL formal tables
    detected_tables = detect_all_tables(lines)
    
    is_structured = len(detected_tables) > 0
    table_detected = is_structured
    
    tables = []
    end_idx = len(lines)
    
    if is_structured:
        for idx, (columns, t_start_idx, t_end_idx) in enumerate(detected_tables):
            table_lines = lines[t_start_idx+1:t_end_idx]
            items = extract_table_rows(table_lines, columns)
            tables.append({
                "title": f"Extracted Table {idx + 1}" if len(detected_tables) > 1 else "Extracted Table",
                "columns": [col["key"] for col in columns],
                "rows": items
            })
        end_idx = detected_tables[-1][2] # Footer lines will start after the last table
    
    # Calculate overall confidence
    all_char_conf = [e["confidence"] for e in elements if "confidence" in e]
    char_conf = sum(all_char_conf) / len(all_char_conf) if all_char_conf else 1.0
    
    # Calculate page count
    all_pages = set(e.get("page", 1) for e in elements)
    page_count = len(all_pages) if all_pages else 1
    
    # Final confidence is an average of classification confidence and text/table confidence
    final_confidence = (base_class_conf + char_conf) / 2
    if not is_related:
        final_confidence = char_conf # for general docs, just use char confidence
        
    if not is_structured:
        # Fallback: parse key-value pairs from the raw text
        kv = extract_kv_table(lines)
        if kv["rows"]:
            is_structured = True
            tables.append({
                "title": "Extracted Data",
                "columns": kv["columns"],
                "rows": kv["rows"],
                "notes": kv["notes"]
            })
        if "details" in kv and kv["details"]:
            # Merge any fallback details discovered late
            doc_details.update(kv["details"])
        
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
        } if doc_details.get("Invoice No.") or doc_details.get("Invoice Number") or doc_details.get("Bill No.") else None,
        "totals": totals
    }
