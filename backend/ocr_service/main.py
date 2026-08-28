from fastapi import FastAPI, UploadFile, File, HTTPException
import shutil
import os
import tempfile
from typing import Dict, Any

from preprocessing import preprocess_document
from ocr_service import extract_data

app = FastAPI(title="SMTBMS OCR Service")

@app.post("/process")
async def process_document(file: UploadFile = File(...)) -> Dict[str, Any]:
    try:
        # Save uploaded file temporarily
        _, ext = os.path.splitext(file.filename)
        temp_dir = tempfile.mkdtemp()
        temp_path = os.path.join(temp_dir, f"upload{ext}")
        
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # 1. Preprocess (Handles PDF conversion, blur detection, orientation, upscaling)
        processed_images, page_count = preprocess_document(temp_path)
        
        if not processed_images:
            raise HTTPException(status_code=400, detail="Could not process document. File may be corrupted.")
            
        # 2. Extract Data using Gemini
        # We pass all pages to Gemini to get a combined structured output
        result = extract_data(processed_images)
        
        # Cleanup
        try:
            os.remove(temp_path)
            for img_path in processed_images:
                if os.path.exists(img_path):
                    os.remove(img_path)
            os.rmdir(temp_dir)
        except Exception as e:
            print(f"Warning: Failed to cleanup temp files: {e}")
            
        result["pageCount"] = page_count
        return result
        
    except Exception as e:
        print(f"Error processing document: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
