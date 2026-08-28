import sys
import logging
logging.basicConfig(level=logging.INFO)
from services.ocr_service import _ocr_image_elements, extract_text
import json

try:
    res = extract_text("test_ocr.jpg")
    print(json.dumps(res, indent=2))
except Exception as e:
    import traceback
    traceback.print_exc()
