import os
import shutil
from fastapi import UploadFile

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

def save_upload_file(upload_file: UploadFile, destination: str) -> str:
    try:
        with open(destination, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
    finally:
        upload_file.file.close()
    return destination

def get_file_extension(filename: str) -> str:
    return os.path.splitext(filename)[1].lower()

def is_pdf(filename: str) -> bool:
    return get_file_extension(filename) == '.pdf'

def is_supported_image(filename: str) -> bool:
    ext = get_file_extension(filename)
    return ext in ['.jpg', '.jpeg', '.png']
