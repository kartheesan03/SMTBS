"""
validator.py
────────────
Invoice validation engine:
  1. Mathematical validation (qty × rate = line_amount, sum → subtotal → grand_total)
  2. Required field presence check
  3. Duplicate detection via document fingerprint (SHA-256)
  4. Purchase Order matching against existing PO records (via Node.js API call)
"""
import re
import hashlib
from typing import Dict, Any, List, Optional


def _parse_num(val: Any) -> Optional[float]:
    """Parse a numeric string — handles commas, currency symbols, spaces."""
    if val is None:
        return None
    s = str(val).replace(',', '').replace(' ', '')
    s = re.sub(r'[^\d.\-]', '', s)
    try:
        return float(s) if s else None
    except ValueError:
        return None


def validate_invoice(structured: Dict[str, Any]) -> Dict[str, Any]:
    """
    Run all validation checks on a structured invoice dict.
    Returns a validation_result dict consumed by the Node.js controller.
    """
    issues  = []
    checks  = {}
    details = {}

    # ── 1. Required fields ────────────────────────────────────────────────────
    vendor_name   = (structured.get('vendor', {}) or {}).get('name', '').strip()
    invoice_number = (structured.get('invoice', {}) or {}).get('number', '').strip()
    invoice_date  = (structured.get('invoice', {}) or {}).get('date', '').strip()

    checks['vendor_identified']         = bool(vendor_name)
    checks['invoice_number_identified'] = bool(invoice_number)
    checks['invoice_date_identified']   = bool(invoice_date)

    if not vendor_name:
        issues.append({'field': 'vendor_name', 'type': 'missing', 'message': 'Vendor name not identified'})
    if not invoice_number:
        issues.append({'field': 'invoice_number', 'type': 'missing', 'message': 'Invoice number not identified'})
    if not invoice_date:
        issues.append({'field': 'invoice_date', 'type': 'missing', 'message': 'Invoice date not identified'})

    # ── 2. Line item math validation ─────────────────────────────────────────
    line_items  = structured.get('line_items', {}) or {}
    rows        = line_items.get('rows', []) or []
    cols        = [c.lower() for c in (line_items.get('columns', []) or [])]

    line_totals_valid = True
    line_sum = 0.0
    row_results = []

    # Find column name mappings
    def find_col(aliases):
        for a in aliases:
            if a in cols:
                return a
        return None

    qty_col    = find_col(['qty', 'quantity', 'nos', 'units', 'pcs'])
    rate_col   = find_col(['rate', 'unit price', 'price', 'unit rate'])
    amount_col = find_col(['amount', 'total', 'net amount', 'value', 'net', 'total amount'])

    for i, row in enumerate(rows):
        row_lower = {k.lower(): v for k, v in row.items()}
        qty  = _parse_num(row_lower.get(qty_col))    if qty_col    else None
        rate = _parse_num(row_lower.get(rate_col))   if rate_col   else None
        amt  = _parse_num(row_lower.get(amount_col)) if amount_col else None

        row_valid = True
        expected  = None
        if qty is not None and rate is not None and amt is not None:
            expected = round(qty * rate, 2)
            row_valid = abs(expected - amt) < 1.0  # Allow ₹1 rounding tolerance
            if not row_valid:
                line_totals_valid = False
                issues.append({
                    'field': f'row_{i+1}_amount',
                    'type': 'calculation_mismatch',
                    'message': f'Row {i+1}: {qty} × {rate} = {expected}, but extracted {amt}'
                })

        if amt is not None:
            line_sum += amt

        row_results.append({'row': i+1, 'valid': row_valid, 'expected': expected})

    checks['line_items_math_valid'] = line_totals_valid
    details['row_validation'] = row_results

    # ── 3. Totals block validation ────────────────────────────────────────────
    totals = structured.get('totals', {}) or {}
    subtotal    = _parse_num(totals.get('subtotal'))
    grand_total = _parse_num(totals.get('grand_total'))
    cgst        = _parse_num(totals.get('cgst'))
    sgst        = _parse_num(totals.get('sgst'))
    igst        = _parse_num(totals.get('igst'))
    discount    = _parse_num(totals.get('discount')) or 0.0
    other_tax   = _parse_num(totals.get('tax'))

    # Check: line items sum ≈ subtotal
    if subtotal is not None and rows:
        diff = abs(line_sum - subtotal)
        checks['subtotal_matches_lines'] = diff < 2.0
        if diff >= 2.0:
            issues.append({
                'field': 'subtotal',
                'type': 'calculation_mismatch',
                'message': f'Line items sum ({line_sum:.2f}) does not match subtotal ({subtotal:.2f})'
            })
    else:
        checks['subtotal_matches_lines'] = None  # Cannot verify — data missing

    # Check: subtotal + taxes - discount ≈ grand_total
    if grand_total is not None and subtotal is not None:
        tax_sum = 0.0
        if cgst:       tax_sum += cgst
        if sgst:       tax_sum += sgst
        if igst:       tax_sum += igst
        if other_tax:  tax_sum += other_tax
        expected_total = round(subtotal + tax_sum - discount, 2)
        diff = abs(expected_total - grand_total)
        checks['grand_total_valid'] = diff < 2.0
        details['expected_grand_total'] = expected_total
        details['extracted_grand_total'] = grand_total
        if diff >= 2.0:
            issues.append({
                'field': 'grand_total',
                'type': 'calculation_mismatch',
                'message': f'Expected grand total {expected_total}, found {grand_total} (diff: {diff:.2f})'
            })
    else:
        checks['grand_total_valid'] = None

    # ── 4. Overall math status ────────────────────────────────────────────────
    math_checks = [v for v in [
        checks.get('line_items_math_valid'),
        checks.get('subtotal_matches_lines'),
        checks.get('grand_total_valid'),
    ] if v is not None]

    checks['math_valid'] = all(math_checks) if math_checks else True

    # ── 5. Overall readiness ──────────────────────────────────────────────────
    has_critical_issue = any(
        i['type'] == 'calculation_mismatch' for i in issues
    )
    overall_status = 'Needs_Verification' if has_critical_issue else 'Ready_For_Approval'

    return {
        'checks':         checks,
        'issues':         issues,
        'details':        details,
        'math_valid':     checks.get('math_valid', True),
        'overall_status': overall_status,
        'issue_count':    len(issues),
    }


def generate_fingerprint(vendor_name: str, invoice_number: str,
                          invoice_date: str, grand_total: str) -> str:
    """
    Generate a SHA-256 fingerprint for duplicate detection.
    Normalized to avoid false mismatches from spacing/case.
    """
    def norm(s):
        return re.sub(r'\s+', '', str(s or '').upper().strip())

    raw = f"{norm(vendor_name)}|{norm(invoice_number)}|{norm(invoice_date)}|{norm(grand_total)}"
    return hashlib.sha256(raw.encode()).hexdigest()


def match_purchase_order(invoice_data: Dict, po_data: Dict) -> Dict:
    """
    Compare invoice against a PO record.
    po_data should have: vendor_name, total_amount, items (list of {name, qty, unit_price})
    Returns: { status, matched_fields, mismatched_fields, overall }
    """
    if not po_data:
        return {'status': 'No PO', 'overall': 'no_po'}

    matched    = []
    mismatched = []

    inv_vendor = (invoice_data.get('vendor', {}) or {}).get('name', '').upper().strip()
    po_vendor  = str(po_data.get('vendor_name', '')).upper().strip()

    if inv_vendor and po_vendor:
        if inv_vendor in po_vendor or po_vendor in inv_vendor:
            matched.append('Vendor')
        else:
            mismatched.append({'field': 'Vendor', 'po': po_vendor, 'invoice': inv_vendor})

    inv_total = _parse_num((invoice_data.get('totals', {}) or {}).get('grand_total'))
    po_total  = _parse_num(po_data.get('total_amount'))

    if inv_total is not None and po_total is not None:
        if abs(inv_total - po_total) < 2.0:
            matched.append('Total Amount')
        else:
            mismatched.append({
                'field': 'Total Amount',
                'po': po_total,
                'invoice': inv_total,
                'diff': round(abs(inv_total - po_total), 2)
            })

    if not matched and not mismatched:
        overall = 'no_data'
    elif not mismatched:
        overall = 'matched'
    elif matched:
        overall = 'partial_match'
    else:
        overall = 'mismatch'

    return {
        'status':            overall.replace('_', ' ').title(),
        'matched_fields':    matched,
        'mismatched_fields': mismatched,
        'overall':           overall,
    }
