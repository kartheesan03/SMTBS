from sqlalchemy import Column, Integer, String, Text, DateTime
from database import Base
import datetime

class OCRDocument(Base):
    __tablename__ = "ocr_documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    filepath = Column(String)
    document_type = Column(String, default="Unknown")
    pages = Column(Integer)
    text = Column(Text)
    uploaded_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
