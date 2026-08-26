from pydantic import BaseModel
from typing import List, Dict, Any, Optional

ROLE_SCHEMAS = {
    "hr": ["Name", "Email", "Phone", "Position", "Experience", "Education"],
    "manager": ["Employee", "Department", "Review Period", "Rating", "Status"],
    "sales": ["Invoice No.", "Client", "Amount", "Due Date", "Status"],
    "employee": ["Item", "Category", "Amount", "Date", "Status"]
}

class ExtractResponse(BaseModel):
    role: str
    rows: List[List[str]]
    errors: List[Dict[str, Any]] = []
