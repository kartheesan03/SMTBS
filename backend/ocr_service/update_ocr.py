import re
import os

with open(r"c:\Users\Admin\Documents\project\backend\ocr_service\services\ocr_service.py", "r", encoding="utf-8") as f:
    content = f.read()

multipass_code = """
def _compute_iou(boxA, boxB):
    xA = max(boxA['x0'], boxB['x0'])
    yA = max(boxA['y0'], boxB['y0'])
    xB = min(boxA['x1'], boxB['x1'])
    yB = min(boxA['y1'], boxB['y1'])

    interArea = max(0, xB - xA + 1) * max(0, yB - yA + 1)
    if interArea == 0:
        return 0.0

    boxAArea = (boxA['x1'] - boxA['x0'] + 1) * (boxA['y1'] - boxA['y0'] + 1)
    boxBArea = (boxB['x1'] - boxB['x0'] + 1) * (boxB['y1'] - boxB['y0'] + 1)

    return interArea / float(boxAArea + boxBArea - interArea)

def _ocr_image_elements(img_path: str, page_num: int = 1) -> list:
    import cv2
    import numpy as np
    import time
    t0 = time.time()
    logger.info(f"[TIMING] EasyOCR Multipass page {page_num}: starting...")
    
    reader = _get_reader()
    
    # 1. Base Image - Use existing preprocess_image (includes Deskew, EXIF, etc.)
    base_img_path = preprocess_image(img_path)
    
    img = cv2.imread(base_img_path)
    if img is None:
        return []
        
    passes = []
    
    # Pass 1: Original Preprocessed
    pass1_path = base_img_path + "_p1.png"
    cv2.imwrite(pass1_path, img)
    passes.append((pass1_path, 1.0))
    
    # Pass 2: Upscaled (2x)
    scale = 2.0
    img_up = cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
    pass2_path = base_img_path + "_p2.png"
    cv2.imwrite(pass2_path, img_up)
    passes.append((pass2_path, scale))
    
    # Pass 3: Enhanced/Sharpened
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)
    kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
    sharpened = cv2.filter2D(enhanced, -1, kernel)
    pass3_path = base_img_path + "_p3.png"
    cv2.imwrite(pass3_path, sharpened)
    passes.append((pass3_path, 1.0))
    
    # Pass 4: Grayscale/Threshold
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)
    pass4_path = base_img_path + "_p4.png"
    cv2.imwrite(pass4_path, thresh)
    passes.append((pass4_path, 1.0))
    
    all_pass_results = []
    
    for path, sc in passes:
        try:
            res = reader.readtext(path)
            norm_res = []
            for bbox, text, conf in res:
                text = str(text)
                if not text.strip(): continue
                try: conf = float(conf)
                except: conf = 0.0
                if conf < 0: conf = 0.0
                text = clean_ocr_text(text)
                if not text: continue
                
                x0 = float(min(p[0] for p in bbox)) / sc
                x1 = float(max(p[0] for p in bbox)) / sc
                y0 = float(min(p[1] for p in bbox)) / sc
                y1 = float(max(p[1] for p in bbox)) / sc
                
                norm_res.append({
                    "text": text,
                    "confidence": conf,
                    "x0": x0,
                    "y0": y0,
                    "x1": x1,
                    "y1": y1,
                    "page": page_num
                })
            all_pass_results.append(norm_res)
        except Exception as e:
            logger.error(f"Pass failed: {e}")
            all_pass_results.append([])
        finally:
            if os.path.exists(path):
                try: os.remove(path)
                except: pass
                
    if base_img_path != img_path and os.path.exists(base_img_path):
        try: os.remove(base_img_path)
        except: pass
                
    # Fallback if first pass fails
    if not all_pass_results[0]:
        all_pass_results = sorted(all_pass_results, key=len, reverse=True)
        if not all_pass_results[0]:
            return []
            
    base_elements = all_pass_results[0]
    
    # Merge results
    for i in range(len(base_elements)):
        best_el = base_elements[i]
        for p_idx in range(1, len(all_pass_results)):
            for candidate in all_pass_results[p_idx]:
                if _compute_iou(best_el, candidate) > 0.5:
                    if candidate['confidence'] > best_el['confidence']:
                        best_el = candidate
                        break
        base_elements[i] = best_el
        
    logger.info(f"[TIMING] EasyOCR Multipass page {page_num}: {time.time()-t0:.1f}s")
    return base_elements
"""

content = re.sub(r'def _ocr_image_elements\(img_path: str, page_num: int = 1\) -> list:.*?return elements', multipass_code, content, flags=re.DOTALL)

with open(r"c:\Users\Admin\Documents\project\backend\ocr_service\services\ocr_service.py", "w", encoding="utf-8") as f:
    f.write(content)
