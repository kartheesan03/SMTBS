from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import os
import uuid
from services.ocr_service import extract_text

router = APIRouter()
UPLOAD_DIR = "uploads"
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp", ".tiff", ".tif", ".gif"}
ALLOWED_EXTENSIONS = IMAGE_EXTENSIONS | {".pdf"}

os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/api/ocr")
async def ocr_endpoint(file: UploadFile = File(...)):
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    ext = os.path.splitext(file.filename)[1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        return JSONResponse(
            status_code=400,
            content={"success": False, "error": f"Unsupported file type '{ext}'. Allowed: JPG, PNG, BMP, WEBP, TIFF, GIF, PDF."}
        )

    file_bytes = await file.read()

    if len(file_bytes) > MAX_FILE_SIZE:
        return JSONResponse(
            status_code=400,
            content={"success": False, "error": "File exceeds maximum size of 50MB."}
        )

    if len(file_bytes) == 0:
        return JSONResponse(
            status_code=400,
            content={"success": False, "error": "Uploaded file is empty."}
        )

    safe_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    try:
        with open(file_path, "wb") as buffer:
            buffer.write(file_bytes)

        text = extract_text(file_path, ext)
        return JSONResponse(content={"success": True, "text": text})
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": f"OCR processing failed: {str(e)}"}
        )
