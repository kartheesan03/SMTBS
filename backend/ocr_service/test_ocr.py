import sys
import logging
logging.basicConfig(level=logging.INFO)
from services.ocr_service import _ocr_image_elements, preprocess_image, _get_reader
import cv2
import numpy as np

print("Testing...")
try:
    # create a dummy image with text to test
    img = np.zeros((100, 300, 3), dtype=np.uint8)
    cv2.putText(img, 'HELLO WORLD', (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv2.LINE_AA)
    cv2.imwrite("dummy.png", img)
    print("Dummy created")
    res = _ocr_image_elements("dummy.png")
    print(f"Result length: {len(res)}")
    print(res)
except Exception as e:
    import traceback
    traceback.print_exc()
