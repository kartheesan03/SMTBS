FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for OCR (like poppler for PDF processing if needed, though this project uses fitz/PyMuPDF)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file and install dependencies
COPY backend/ocr_service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire ocr_service directory to /app
COPY backend/ocr_service/ .

# Expose port
EXPOSE 8000

# Start the FastAPI application using uvicorn
CMD uvicorn main:app --host 0.0.0.0 --port $PORT
