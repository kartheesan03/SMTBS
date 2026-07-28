from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime
import datetime
from database import Base

class AIExtraction(Base):
    __tablename__ = "ai_extractions"

    id = Column(Integer, primary_key=True, index=True)
    ocr_document_id = Column(Integer, index=True, nullable=True) # Optional link to OCR
    json_data = Column(Text) # Store stringified JSON
    confidence = Column(Float, default=1.0)
    reviewed = Column(Boolean, default=False)
    model = Column(String, default="claude-3-5-sonnet-20241022")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
