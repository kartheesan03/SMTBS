"""
invoice_parser.py
─────────────────
Intelligent invoice document understanding layer.
Sits on top of raw EasyOCR results and extracts structured invoice blocks:
  - Vendor info
  - Invoice header (number, date, due date, PO, currency)
  - Customer / billing info
  - Line items with DYNAMIC column detection
  - Totals block

Does NOT assume a fixed layout. Uses heuristic matching on raw text lines.
"""
import re
from typing import List, Dict, Any, Tuple

# ─── Field patterns ───────────────────────────────────────────────────────────
_GSTIN_RE  = re.compile(r'\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}\b')
_PHONE_RE  = re.compile(r'(?:mob|mobile|phone|ph|tel)[:\s]*([+\d\s\-()]{7,15})', re.I)
_EMAIL_RE  = re.compile(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}')
_DATE_RE   = re.compile(r'\b(\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4}|\d{4}[-/\.]\d{1,2}[-/\.]\d{1,2}|'
                        r'\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{2,4})\b', re.I)
_AMOUNT_RE = re.compile(r'[\u20b9$€£]?\s*[\d,]+(?:\.\d{1,2})?')
_INV_NO_RE = re.compile(r'(?:inv[a-z0-9]*ce\s*(?:no|number|#|num)?|inv\s*(?:no|#)?|bill\s*no)[:\s#]*([A-Z0-9\-/]+)', re.I)
_PO_RE     = re.compile(r'(?:po|purchase\s*order|p\.o\.)\s*(?:no|number|#)?[:\s]*([A-Z0-9\-/]+)', re.I)
_DUE_RE    = re.compile(r'due\s*(?:date|on)?[:\s]*(.+)', re.I)

# ─── Known column header aliases ──────────────────────────────────────────────
COL_ALIASES = {
    'sno': ['s.no', 's no', 'sl no', 'sl.no', 'sno', 'sr.no', 'sr no', '#', 'no.', 'serial'],
    'item': ['item', 'product', 'description', 'particulars', 'goods', 'service',
             'item name', 'product name', 'desc', 'detail', 'details'],
    'hsn': ['hsn', 'sac', 'hsn/sac', 'hsn code', 'sac code'],
    'qty': ['qty', 'quantity', 'nos', 'units', 'pcs', 'pieces', 'unit qty'],
    'unit': ['unit', 'uom', 'u/m', 'measure'],
    'rate': ['rate', 'price', 'unit price', 'unit rate', 'mrp', 'basic rate', 'per unit'],
    'discount': ['discount', 'disc', 'disc.', 'less', 'deduction'],
    'tax': ['tax', 'tax%', 'tax rate', 'gst', 'gst%'],
    'cgst': ['cgst', 'cgst%', 'cgst amt', 'central gst'],
    'sgst': ['sgst', 'sgst%', 'sgst amt', 'state gst'],
    'igst': ['igst', 'igst%', 'igst amt', 'integrated gst'],
    'amount': ['amount', 'total', 'net', 'value', 'total amount', 'net amount', 'price', 'subtotal'],
}

TOTAL_KEYWORDS = {
    'subtotal': ['subtotal', 'sub total', 'sub-total', 'taxable amount', 'taxable value', 'basic amount'],
    'cgst':     ['cgst', 'central gst', 'c.g.s.t'],
    'sgst':     ['sgst', 'state gst', 's.g.s.t'],
    'igst':     ['igst', 'integrated gst', 'i.g.s.t'],
    'discount': ['discount', 'less discount', 'total discount'],
    'round_off':['round off', 'rounding', 'round-off'],
    'grand_total': ['grand total', 'net total', 'net payable', 'total payable', 'amount payable',
                    'total amount', 'net amount due', 'invoice total', 'balance due'],
    'tax':      ['tax', 'total tax', 'gst amount', 'total gst'],
    'cess':     ['cess', 'total cess'],
}

VENDOR_TRIGGERS  = ['gstin', 'gst no', 'gst number', 'mob:', 'mobile:', 'phone:',
                    'tel:', 'ph:', 'email:', 'www.', 'http']
INVOICE_TRIGGERS = ['invoice', 'bill', 'receipt', 'tax invoice', 'proforma']
CUSTOMER_TRIGGERS= ['bill to', 'ship to', 'sold to', 'buyer', 'customer', 'consignee', 'party']

# ─── Helpers ──────────────────────────────────────────────────────────────────

def _clean(s: str) -> str:
    return ' '.join(s.split()).strip()

def _find_amount(text: str) -> str:
    """Extract the last numeric amount from a line."""
    nums = _AMOUNT_RE.findall(text)
    return _clean(nums[-1]) if nums else ''

def _normalize_col(name: str) -> str:
    """Map detected column text to a canonical key, or return the raw name."""
    n = name.lower().strip().rstrip('.')
    for canonical, aliases in COL_ALIASES.items():
        if n in aliases:
            return canonical.upper()
    return name.strip().title()  # Return as-is if not recognized

def _detect_confidence(conf: float) -> str:
    if conf >= 0.9:  return 'high'
    if conf >= 0.75: return 'medium'
    return 'low'

# ─── Main parser class ────────────────────────────────────────────────────────

class InvoiceParser:

    def parse(self, ocr_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main entry: take raw OCR result dict and return structured invoice.
        ocr_result must have at minimum:
          - 'lines': list of line-objects [{'text': '...', 'conf': 0.9, 'bbox': ...}, ...]
          - 'raw_text': full text string
        """
        lines      = ocr_result.get('lines', [])
        raw_text   = ocr_result.get('raw_text', '')
        conf_map   = ocr_result.get('field_confidence_raw', {})

        vendor   = self._extract_vendor(lines, raw_text)
        invoice  = self._extract_invoice_header(lines, raw_text)
        customer = self._extract_customer(lines, raw_text)
        items    = self._extract_line_items(lines)
        totals   = self._extract_totals(lines, raw_text)
        doc_type = self._determine_doc_type(raw_text)
        raw_fields = self._extract_raw_fields(lines)

        field_confidence = self._build_field_confidence(vendor, invoice, customer, totals, conf_map)

        return {
            'document_type': doc_type,
            'vendor':        vendor,
            'invoice':       invoice,
            'customer':      customer,
            'line_items':    items,
            'totals':        totals,
            'field_confidence': field_confidence,
            'raw_fields':    raw_fields,
        }

    # ─── Raw Fields (Key-Value fallback) ──────────────────────────────────────
    def _extract_raw_fields(self, lines: List) -> List[Dict]:
        """Extract generic label: value pairs when structure is unknown."""
        fields = []
        for line_obj in lines:
            text = line_obj.get('text', '').strip()
            # Look for explicit label-value patterns (e.g. "Order Date: 12/12/23" or "Account Number 123456")
            if ':' in text:
                parts = text.split(':', 1)
                if len(parts) == 2 and len(parts[0].strip()) > 1 and len(parts[1].strip()) > 1:
                    fields.append({
                        'label': parts[0].strip(),
                        'value': parts[1].strip(),
                        'confidence': round(line_obj.get('conf', 0), 4)
                    })
        return fields

    # ─── Document type ────────────────────────────────────────────────────────
    def _determine_doc_type(self, text: str) -> str:
        t = text.lower()
        if 'tax invoice' in t:        return 'Tax Invoice'
        if 'proforma'    in t:        return 'Proforma Invoice'
        if 'quotation'   in t or 'quote' in t: return 'Quotation'
        if 'purchase order' in t or 'po no' in t: return 'Purchase Order'
        if 'receipt'     in t:        return 'Receipt'
        if 'invoice'     in t:        return 'Invoice'
        if 'bill'        in t:        return 'Bill'
        if 'delivery'    in t:        return 'Delivery Note'
        return 'General'

    # ─── Vendor block ─────────────────────────────────────────────────────────
    def _extract_vendor(self, lines: List, raw_text: str) -> Dict:
        vendor = {'name': '', 'address': '', 'gstin': '', 'phone': '', 'email': '', 'website': ''}

        # GSTIN is most reliable anchor
        gstin_match = _GSTIN_RE.search(raw_text)
        if gstin_match:
            vendor['gstin'] = gstin_match.group(0)

        phone_match = _PHONE_RE.search(raw_text)
        if phone_match:
            vendor['phone'] = _clean(phone_match.group(1))

        email_match = _EMAIL_RE.search(raw_text)
        if email_match:
            vendor['email'] = email_match.group(0)

        # Company name heuristic: first prominent line (usually all-caps or large font)
        address_lines = []
        found_name = False
        for line_obj in lines[:15]:  # Vendor block is usually in first 15 lines
            text = line_obj.get('text', '').strip()
            if not text or len(text) < 2:
                continue
            tl = text.lower()

            # Skip obvious non-vendor lines and garbled OCR lines
            if any(kw in tl for kw in ['invoice', 'bill no', 'date', 'sl no', 'qty', 'rate', 'original']):
                continue
            if ']' in text or '[' in text or '?' in text:
                continue

            if not found_name and len(text) > 3:
                # First substantial line is likely the company name
                vendor['name'] = text
                found_name = True
            elif found_name and not vendor['gstin'] in text and 'mob' not in tl and 'ph' not in tl:
                address_lines.append(text)

        vendor['address'] = ', '.join(address_lines[:4])
        return vendor

    # ─── Invoice header ───────────────────────────────────────────────────────
    def _extract_invoice_header(self, lines: List, raw_text: str) -> Dict:
        inv = {
            'number': '', 'date': '', 'due_date': '', 'po_number': '',
            'reference': '', 'currency': 'INR', 'payment_terms': ''
        }

        inv_match = _INV_NO_RE.search(raw_text)
        if inv_match:
            inv['number'] = _clean(inv_match.group(1))

        po_match = _PO_RE.search(raw_text)
        if po_match:
            inv['po_number'] = _clean(po_match.group(1))

        due_match = _DUE_RE.search(raw_text)
        if due_match:
            inv['due_date'] = _clean(due_match.group(1))

        # Extract all dates found in text
        all_dates = _DATE_RE.findall(raw_text)
        if all_dates:
            inv['date'] = _clean(all_dates[0]) if all_dates else ''
            if len(all_dates) > 1 and not inv['due_date']:
                inv['due_date'] = _clean(all_dates[1])

        # Detect currency symbol
        if '₹' in raw_text or 'inr' in raw_text.lower() or 'rs.' in raw_text.lower():
            inv['currency'] = 'INR'
        elif '$' in raw_text:
            inv['currency'] = 'USD'
        elif '€' in raw_text:
            inv['currency'] = 'EUR'

        return inv

    # ─── Customer block ───────────────────────────────────────────────────────
    def _extract_customer(self, lines: List, raw_text: str) -> Dict:
        customer = {'name': '', 'billing_address': '', 'shipping_address': '', 'gstin': '', 'id': ''}

        in_customer = False
        billing_lines = []
        for line_obj in lines:
            text = line_obj.get('text', '').strip()
            tl   = text.lower()

            if any(kw in tl for kw in CUSTOMER_TRIGGERS):
                in_customer = True
                continue

            if in_customer:
                # Stop at next section header
                if any(kw in tl for kw in ['item', 'description', 'sl no', 's.no', 'qty', 'hsn', 'amount', 'product']):
                    break
                if text:
                    billing_lines.append(text)

        # Find second GSTIN (customer's)
        gstins = _GSTIN_RE.findall(raw_text)
        if len(gstins) > 1:
            customer['gstin'] = gstins[1]  # Second GSTIN is usually customer's

        if billing_lines:
            customer['name'] = billing_lines[0]
            customer['billing_address'] = ', '.join(billing_lines[1:5])

        return customer

    # ─── Line items: dynamic column detection ─────────────────────────────────
    def _extract_line_items(self, lines: List) -> Dict:
        """
        Detect the header row of a table, normalize column names,
        then extract all data rows.
        """
        # Step 1: Find the header row
        header_row_idx = -1
        detected_cols  = []

        for i, line_obj in enumerate(lines):
            text = line_obj.get('text', '')
            tl   = text.lower()
            # A line is a table header if it contains at least 2 known column keywords
            hits = sum(1 for aliases in COL_ALIASES.values() if any(a in tl for a in aliases))
            if hits >= 2:
                header_row_idx = i
                # Extract individual column tokens from this line
                tokens = self._split_header_tokens(line_obj)
                detected_cols = [_normalize_col(t) for t in tokens if t.strip()]
                break

        if header_row_idx < 0 or not detected_cols:
            # No table header found — return empty
            return {'columns': [], 'rows': []}

        # Step 2: Extract data rows below the header
        rows = []
        for line_obj in lines[header_row_idx + 1:]:
            text = line_obj.get('text', '').strip()
            if not text:
                continue
            # Stop if we hit a totals section
            tl = text.lower()
            if any(kw in tl for kw in ['subtotal', 'grand total', 'total amount', 'net total',
                                        'cgst', 'sgst', 'igst', 'discount', 'round off']):
                break

            row_values = self._split_row_values(line_obj, len(detected_cols))
            if row_values:
                row = {}
                for j, col in enumerate(detected_cols):
                    row[col] = row_values[j] if j < len(row_values) else ''
                rows.append(row)

        return {'columns': detected_cols, 'rows': rows}

    def _split_header_tokens(self, line_obj: Dict) -> List[str]:
        """Split a header line into column name tokens."""
        text = line_obj.get('text', '')
        # Try splitting on multiple spaces or known separators
        parts = re.split(r'\s{2,}|[|/]', text)
        if len(parts) < 2:
            # Single-token line — split on common separators
            parts = text.split()
        return [p.strip() for p in parts if p.strip()]

    def _split_row_values(self, line_obj: Dict, n_cols: int) -> List[str]:
        """Split a data row into column values."""
        text = line_obj.get('text', '').strip()
        if not text:
            return []

        # Try splitting on 2+ spaces
        parts = re.split(r'\s{2,}|[|]', text)
        if len(parts) >= 2:
            return [p.strip() for p in parts]

        # Fall back to whitespace split for short rows
        return text.split()

    # ─── Totals block ─────────────────────────────────────────────────────────
    def _extract_totals(self, lines: List, raw_text: str) -> Dict:
        totals = {}
        for line_obj in lines:
            text = line_obj.get('text', '').strip()
            tl   = text.lower()
            amount = _find_amount(text)
            if not amount:
                continue

            for key, keywords in TOTAL_KEYWORDS.items():
                if any(kw in tl for kw in keywords):
                    if key not in totals:  # First match wins
                        totals[key] = amount
                    break
        return totals

    # ─── Build field confidence map ───────────────────────────────────────────
    def _build_field_confidence(self, vendor, invoice, customer, totals, raw_conf_map) -> Dict:
        result = {}
        all_fields = {
            'vendor_name':    vendor.get('name', ''),
            'vendor_gstin':   vendor.get('gstin', ''),
            'vendor_phone':   vendor.get('phone', ''),
            'invoice_number': invoice.get('number', ''),
            'invoice_date':   invoice.get('date', ''),
            'due_date':       invoice.get('due_date', ''),
            'po_number':      invoice.get('po_number', ''),
            'customer_name':  customer.get('name', ''),
            'grand_total':    totals.get('grand_total', ''),
            'subtotal':       totals.get('subtotal', ''),
        }

        for field, value in all_fields.items():
            if not value:
                result[field] = {'value': '', 'confidence': 0, 'level': 'low', 'needs_verification': True}
            else:
                # Use raw OCR confidence if available, else estimate from regex match quality
                conf = raw_conf_map.get(field, 0.85)
                level = _detect_confidence(conf)
                result[field] = {
                    'value': value,
                    'confidence': round(conf, 2),
                    'level': level,
                    'needs_verification': level == 'low'
                }

        return result


# Singleton
_parser = InvoiceParser()

def parse_invoice(ocr_result: Dict[str, Any]) -> Dict[str, Any]:
    return _parser.parse(ocr_result)
