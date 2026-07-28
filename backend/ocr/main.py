from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine
import routes

# Create database tables if they don't exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="SMTBMS OCR Service", version="1.0.0")

# Configure CORS (allow all for simplicity, or configure specific origins in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles

app.include_router(routes.router)

# Mount uploads directory to serve static files for document previews
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def root():
    return {"message": "OCR Service is running"}
