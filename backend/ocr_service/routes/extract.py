import os
import magic
import asyncio
from typing import List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from schemas import ROLE_SCHEMAS, ExtractResponse
from extraction import extract_document, ExtractionError

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB limit as per requirements

SUPPORTED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/tiff",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
}

@router.post("/api/extract", response_model=ExtractResponse)
@limiter.limit("10/minute")
async def extract_api(
    request: Request,
    files: List[UploadFile] = File(...),
    role: str = Form(...)
):
    role = role.lower()
    if role not in ROLE_SCHEMAS:
        raise HTTPException(status_code=400, detail=f"Invalid role '{role}'. Must be one of: {list(ROLE_SCHEMAS.keys())}")
        
    all_rows = []
    errors = []
    
    async def process_file(file: UploadFile):
        file_bytes = await file.read()
        
        if len(file_bytes) > MAX_FILE_SIZE:
            errors.append({"file": file.filename, "error": "File exceeds 10MB limit"})
            return
            
        # Magic byte sniffing
        mime_type = magic.from_buffer(file_bytes[:2048], mime=True)
        if mime_type not in SUPPORTED_MIME_TYPES:
            # Fallback to check content_type if magic is confused (sometimes happens with docx)
            if file.content_type not in SUPPORTED_MIME_TYPES:
                errors.append({
                    "file": file.filename, 
                    "error": f"Unsupported MIME type. Supported types for {role}: PDF, DOCX, JPEG, PNG, WEBP, TIFF"
                })
                return
            else:
                mime_type = file.content_type
                
        try:
            # The actual extraction logic
            rows = await extract_document(file_bytes, mime_type, role)
            all_rows.extend(rows)
            # Log successful processing without logging PII/data
            print(f"Successfully extracted {len(rows)} rows from {file.filename} for role {role}", flush=True)
        except ExtractionError as e:
            errors.append({"file": file.filename, "error": str(e)})
            print(f"ExtractionError for {file.filename}: {str(e)}", flush=True)
        except Exception as e:
            errors.append({"file": file.filename, "error": f"Unexpected error: {str(e)}"})
            print(f"Unexpected error processing {file.filename}: {str(e)}", flush=True)

    # Process all files concurrently
    await asyncio.gather(*(process_file(file) for file in files))
    
    return ExtractResponse(
        role=role,
        rows=all_rows,
        errors=errors
    )
