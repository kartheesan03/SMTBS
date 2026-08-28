import paddle
import logging

try:
    if hasattr(paddle, 'inference') and hasattr(paddle.inference, 'Config'):
        if not hasattr(paddle.inference.Config, 'set_optimization_level'):
            print("Monkey patching paddle.inference.Config.set_optimization_level")
            paddle.inference.Config.set_optimization_level = lambda self, x: None
            
    if hasattr(paddle, 'base') and hasattr(paddle.base, 'libpaddle') and hasattr(paddle.base.libpaddle, 'AnalysisConfig'):
        if not hasattr(paddle.base.libpaddle.AnalysisConfig, 'set_optimization_level'):
            print("Monkey patching AnalysisConfig")
            paddle.base.libpaddle.AnalysisConfig.set_optimization_level = lambda self, x: None
except Exception as e:
    print("Patch failed", e)

from services.ocr_service import _ocr_image_elements
import cv2
import numpy as np

img = np.zeros((100, 300, 3), dtype=np.uint8)
cv2.putText(img, 'TEST', (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv2.LINE_AA)
cv2.imwrite("dummy.png", img)
print("Dummy created")
res = _ocr_image_elements("dummy.png")
print("SUCCESS!")
