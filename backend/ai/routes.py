from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json

import models, schemas, claude_service, parser
from database import get_db

router = APIRouter(prefix="/api/ai", tags=["AI Extraction"])

@router.post("/extract", response_model=schemas.AIExtractResponse)
def extract_data(request: schemas.AIExtractRequest, db: Session = Depends(get_db)):
    try:
        # Call Claude
        extracted_dict = claude_service.extract_structured_data(request.text)
        
        # Calculate a pseudo confidence (since Claude doesn't provide token probabilities by default)
        confidence = 0.95
        
        # Save to DB
        db_extraction = models.AIExtraction(
            ocr_document_id=request.ocr_document_id,
            json_data=json.dumps(extracted_dict),
            confidence=confidence
        )
        db.add(db_extraction)
        db.commit()
        db.refresh(db_extraction)
        
        # Validate
        issues = parser.validate_extraction(extracted_dict, db)
        
        return schemas.AIExtractResponse(
            id=db_extraction.id,
            json_data=extracted_dict,
            confidence=confidence,
            validation_issues=issues
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/validate", response_model=list[schemas.ValidationIssue])
def validate_data(data: dict, db: Session = Depends(get_db)):
    """ Endpoint for front-end to re-validate edited JSON """
    issues = parser.validate_extraction(data, db)
    return issues

@router.get("/history", response_model=list[schemas.AIHistoryResponse])
def get_history(db: Session = Depends(get_db)):
    return db.query(models.AIExtraction).order_by(models.AIExtraction.created_at.desc()).all()

@router.put("/{extraction_id}/approve")
def approve_extraction(extraction_id: int, updated_json: dict, db: Session = Depends(get_db)):
    doc = db.query(models.AIExtraction).filter(models.AIExtraction.id == extraction_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Extraction not found")
    
    doc.json_data = json.dumps(updated_json)
    doc.reviewed = True
    db.commit()
    return {"status": "success"}

@router.delete("/{extraction_id}")
def delete_extraction(extraction_id: int, db: Session = Depends(get_db)):
    doc = db.query(models.AIExtraction).filter(models.AIExtraction.id == extraction_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Extraction not found")
    
    db.delete(doc)
    db.commit()
    return {"status": "success"}
