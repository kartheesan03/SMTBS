from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime

class AIExtractRequest(BaseModel):
    text: str
    ocr_document_id: Optional[int] = None

class ValidationIssue(BaseModel):
    field: str
    issue: str
    severity: str # "error" or "warning"

class AIExtractResponse(BaseModel):
    id: int
    json_data: Dict[str, Any]
    confidence: float
    validation_issues: List[ValidationIssue] = []
    
class AIHistoryResponse(BaseModel):
    id: int
    ocr_document_id: Optional[int]
    json_data: str
    confidence: float
    reviewed: bool
    model: str
    created_at: datetime

    class Config:
        from_attributes = True
