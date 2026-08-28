from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse, FileResponse
import os
import uuid
from services.ocr_service import extract_text, preprocess_image_custom

router = APIRouter()
UPLOAD_DIR = "uploads"
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp", ".tiff", ".tif", ".gif", ".jfif"}
ALLOWED_EXTENSIONS = IMAGE_EXTENSIONS | {".pdf", ".docx", ".doc"}

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
    file_path = os.path.abspath(os.path.join(UPLOAD_DIR, safe_filename))

    try:
        with open(file_path, "wb") as buffer:
            buffer.write(file_bytes)

        structured_data = extract_text(file_path, ext)
        return JSONResponse(content=structured_data)
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        print(f"ERROR IN OCR:\n{tb}", flush=True)
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": f"Unable to process this image. Please upload a clearer document. (Details: {str(e)})"}
        )
    finally:
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass

@router.post("/api/ocr/enhance")
async def enhance_image(
    file: UploadFile = File(...),
    denoise: bool = Form(True),
    contrast: bool = Form(True),
    sharpen: bool = Form(False)
):
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in IMAGE_EXTENSIONS:
        return JSONResponse(status_code=400, content={"error": "Unsupported file type for enhancement."})
    
    file_bytes = await file.read()
    safe_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.abspath(os.path.join(UPLOAD_DIR, safe_filename))
    
    with open(file_path, "wb") as buffer:
        buffer.write(file_bytes)
        
    try:
        out_path = preprocess_image_custom(file_path, denoise, contrast, sharpen)
        return FileResponse(out_path, media_type=f"image/{ext.replace('.','')}", filename=f"enhanced_{file.filename}")
    except Exception as e:
        if os.path.exists(file_path): os.remove(file_path)
        return JSONResponse(status_code=500, content={"error": str(e)})
