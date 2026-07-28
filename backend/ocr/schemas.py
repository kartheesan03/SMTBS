from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class OCRDocumentBase(BaseModel):
    filename: str
    filepath: str
    document_type: str
    pages: int
    text: str
    uploaded_by: Optional[str] = None

class OCRDocumentCreate(OCRDocumentBase):
    pass

class OCRDocumentResponse(OCRDocumentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class OCRUploadResponse(BaseModel):
    status: str
    id: int
    pages: int
    text: str
    document_type: str = "Unknown"
    filename: str
