from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.ocr import router as ocr_router
from routes.export_routes import router as export_router

app = FastAPI(title="SMTBMS OCR Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ocr_router)
app.include_router(export_router, prefix="/export")

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ocr_engine"}

import os
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
