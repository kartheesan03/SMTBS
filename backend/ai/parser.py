from typing import List, Dict, Any
import schemas
from sqlalchemy.orm import Session
import models
import json

def validate_extraction(data: Dict[str, Any], db: Session) -> List[schemas.ValidationIssue]:
    issues = []

    # Missing Fields
    required_fields = ["document_type"]
    for field in required_fields:
        if field not in data or not data[field]:
            issues.append(schemas.ValidationIssue(field=field, issue=f"Missing required field: {field}", severity="error"))

    if data.get("document_type") == "Invoice":
        if "vendor_name" not in data or not data["vendor_name"]:
            issues.append(schemas.ValidationIssue(field="vendor_name", issue="Missing Vendor Name for Invoice", severity="error"))
        
        # Check math
        try:
            subtotal = float(data.get("subtotal", 0))
            gst = float(data.get("gst", 0))
            grand_total = float(data.get("grand_total", 0))
            if abs((subtotal + gst) - grand_total) > 0.1:
                issues.append(schemas.ValidationIssue(field="totals", issue="Wrong Totals: subtotal + gst != grand_total", severity="error"))
        except (ValueError, TypeError):
            pass
            
        # Duplicate Invoice
        invoice_number = data.get("invoice_number")
        if invoice_number:
            past_docs = db.query(models.AIExtraction).all()
            for doc in past_docs:
                try:
                    past_data = json.loads(doc.json_data)
                    if past_data.get("invoice_number") == invoice_number:
                        issues.append(schemas.ValidationIssue(field="invoice_number", issue="Duplicate Invoice", severity="warning"))
                        break
                except Exception:
                    pass

    # Check Materials
    materials = data.get("materials", [])
    if not materials:
        issues.append(schemas.ValidationIssue(field="materials", issue="Missing Materials list", severity="warning"))
    else:
        for i, item in enumerate(materials):
            try:
                qty = float(item.get("quantity", 0))
                if qty < 0:
                    issues.append(schemas.ValidationIssue(field=f"materials[{i}].quantity", issue="Negative Quantity", severity="error"))
            except (ValueError, TypeError):
                pass
                
    return issues
