import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from fastapi.responses import JSONResponse
from services.ocr_service import extract_text

router = APIRouter()

# Allowed file types: images AND PDFs
ALLOWED_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".webp", ".tiff", ".tif",
    ".pdf",
}

# MIME types accepted
ALLOWED_MIMETYPES = {
    "image/jpeg", "image/png", "image/webp",
    "image/tiff", "image/heic",
    "application/pdf",
}

MAX_FILE_SIZE = 30 * 1024 * 1024  # 30 MB (PDFs can be larger)
UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/ocr")
async def ocr_endpoint(file: UploadFile = File(None)):
    # ── File presence check ────────────────────────────────────────────────────
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file uploaded."
        )

    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file: No filename."
        )

    # ── Extension check ────────────────────────────────────────────────────────
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unsupported file type '{ext}'. "
                "Allowed types: JPG, JPEG, PNG, WEBP, TIFF, PDF"
            )
        )

    # ── Read & size check ─────────────────────────────────────────────────────
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty."
        )

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)} MB."
        )

    # ── Save file ─────────────────────────────────────────────────────────────
    safe_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    try:
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save the uploaded file."
        )

    # ── Run OCR ───────────────────────────────────────────────────────────────
    try:
        extracted_data = extract_text(file_path)

        response_data = {
            "success": True,
            "structured_doc": extracted_data,
        }
        # Spread top-level keys for backward compatibility with Node controller
        response_data.update(extracted_data)

        # Debug log (optional — can be removed in production)
        try:
            import json
            with open("latest_ocr_output.json", "w", encoding="utf-8") as f:
                # Don't write the large base64 image to the log file
                log_data = {k: v for k, v in response_data.items()
                            if k != "processed_image_base64"}
                json.dump(log_data, f, indent=2, ensure_ascii=False)
        except Exception:
            pass

        return JSONResponse(content=response_data)

    except RuntimeError as e:
        # PDF/dependency errors (e.g. pymupdf not installed)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OCR processing failed: {str(e)}"
        )
    finally:
        # Clean up temp upload file
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass
