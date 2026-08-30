import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from fastapi.responses import JSONResponse
from services.ocr_service import extract_text

router = APIRouter()

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
UPLOAD_DIR = "uploads"

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/ocr")
async def ocr_endpoint(file: UploadFile = File(None)):
    if not file:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No file uploaded.")

    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file: No filename.")

    # Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Unsupported file type. Allowed: jpg, jpeg, png")

    # Read and validate file size
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty upload.")
    
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File too large. Maximum size is 10 MB.")

    # Sanitize and generate unique filename
    safe_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    # Save uploaded file
    try:
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to save file.")

    # Call OCR service
    try:
        extracted_data = extract_text(file_path)
        # The new extract_text returns a dict with text, rows, columns, confidence
        # Return the full structured_doc, and also spread it for compatibility
        response_data = {
            "success": True,
            "structured_doc": extracted_data,
        }
        response_data.update(extracted_data)
        
        import json
        with open("latest_ocr_output.json", "w") as f:
            json.dump(response_data, f, indent=2)
            
        return JSONResponse(content=response_data)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"OCR failed: {str(e)}")
    finally:
        # Delete the file after processing to save space and security
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except:
                pass
