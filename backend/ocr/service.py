import os
import easyocr
from pdf2image import convert_from_path
import numpy as np

reader = None

def get_reader():
    global reader
    if reader is None:
        reader = easyocr.Reader(['en'], gpu=False)
    return reader

def process_document(filepath: str, is_pdf: bool) -> tuple[int, str]:
    """
    Extracts text from a document. Returns (number_of_pages, extracted_text).
    """
    extracted_text = []
    num_pages = 0
    ocr_reader = get_reader()

    if is_pdf:
        # Convert PDF to list of PIL Images
        # Note: poppler must be installed on the system
        images = convert_from_path(filepath)
        num_pages = len(images)
        for i, img in enumerate(images):
            # Convert PIL image to numpy array for EasyOCR
            img_np = np.array(img)
            # Read text
            results = ocr_reader.readtext(img_np, detail=0, paragraph=True)
            page_text = "\\n".join(results)
            extracted_text.append(f"--- Page {i+1} ---\\n{page_text}\\n")
    else:
        # It's an image
        num_pages = 1
        results = ocr_reader.readtext(filepath, detail=0, paragraph=True)
        page_text = "\\n".join(results)
        extracted_text.append(page_text)

    full_text = "\\n".join(extracted_text)
    return num_pages, full_text
