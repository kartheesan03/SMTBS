from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import os
import uuid

import models
import schemas
import utils
import service
from database import get_db

router = APIRouter(prefix="/api/ocr", tags=["OCR"])

@router.post("/upload", response_model=schemas.OCRUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form("General"),
    uploaded_by: str = Form(None),
    db: Session = Depends(get_db)
):
    if not (utils.is_pdf(file.filename) or utils.is_supported_image(file.filename)):
        raise HTTPException(status_code=400, detail="Unsupported file format. Use PDF, JPG, JPEG, or PNG.")

    # Generate safe filename and save
    ext = utils.get_file_extension(file.filename)
    safe_filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(utils.UPLOAD_DIR, safe_filename)
    
    try:
        utils.save_upload_file(file, filepath)
        
        # Process OCR
        is_pdf = utils.is_pdf(file.filename)
        pages, text = service.process_document(filepath, is_pdf)
        
        # Save to DB
        db_doc = models.OCRDocument(
            filename=file.filename,
            filepath=filepath,
            document_type=document_type,
            pages=pages,
            text=text,
            uploaded_by=uploaded_by
        )
        db.add(db_doc)
        db.commit()
        db.refresh(db_doc)
        
        return schemas.OCRUploadResponse(
            status="success",
            id=db_doc.id,
            pages=pages,
            text=text,
            document_type=document_type,
            filename=db_doc.filename
        )
        
    except Exception as e:
        # Clean up file on failure if it exists
        if os.path.exists(filepath):
            os.remove(filepath)
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")


@router.get("/history", response_model=list[schemas.OCRDocumentResponse])
def get_history(db: Session = Depends(get_db)):
    docs = db.query(models.OCRDocument).order_by(models.OCRDocument.created_at.desc()).all()
    return docs

@router.get("/{doc_id}", response_model=schemas.OCRDocumentResponse)
def get_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(models.OCRDocument).filter(models.OCRDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="OCR Record not found")
    return doc

@router.delete("/{doc_id}")
def delete_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(models.OCRDocument).filter(models.OCRDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="OCR Record not found")
    
    # Delete file
    if os.path.exists(doc.filepath):
        os.remove(doc.filepath)
        
    # Delete DB record
    db.delete(doc)
    db.commit()
    
    return {"status": "success", "message": "Record deleted"}
