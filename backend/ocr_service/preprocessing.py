import cv2
import numpy as np
from pdf2image import convert_from_path
import tempfile
import os
from PIL import Image

def preprocess_image(image_path, output_dir):
    """
    Apply preprocessing to an image to improve OCR accuracy.
    Includes: grayscale, adaptive thresholding (if text is very faded),
    upscaling for small text.
    """
    img = cv2.imread(image_path)
    if img is None:
        return None
        
    # Check resolution
    h, w = img.shape[:2]
    
    # If image is very small, upscale it
    if h < 1500 or w < 1500:
        scale = max(2.0, 2000.0 / max(h, w))
        img = cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
        
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Deskew (Rotation correction)
    coords = np.column_stack(np.where(gray > 0))
    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle
    if abs(angle) > 0.5:
        (h, w) = gray.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        gray = cv2.warpAffine(gray, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

    # Check blur using Laplacian variance
    variance = cv2.Laplacian(gray, cv2.CV_64F).var()
    if variance < 150:
        # Image is blurry, apply sharpening
        kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
        gray = cv2.filter2D(gray, -1, kernel)
        
    # Apply adaptive thresholding for uneven lighting / shadowed areas
    # But only if it improves contrast significantly
    mean_val = np.mean(gray)
    if mean_val < 100 or mean_val > 200:
        gray = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
        
    # We will output a high-quality JPEG for Gemini
    _, filename = os.path.split(image_path)
    out_path = os.path.join(output_dir, f"proc_{filename}.jpg")
    cv2.imwrite(out_path, gray, [cv2.IMWRITE_JPEG_QUALITY, 95])
    
    return out_path

def preprocess_document(file_path):
    """
    Converts PDF to images if necessary, and applies preprocessing to each page.
    Returns a list of paths to processed images and the page count.
    """
    temp_dir = tempfile.mkdtemp()
    processed_paths = []
    
    if file_path.lower().endswith('.pdf'):
        # Convert PDF to images
        try:
            # Requires poppler installed on the system
            pages = convert_from_path(file_path, 300)
            for i, page in enumerate(pages):
                img_path = os.path.join(temp_dir, f"page_{i}.png")
                page.save(img_path, 'PNG')
                processed_path = preprocess_image(img_path, temp_dir)
                if processed_path:
                    processed_paths.append(processed_path)
                os.remove(img_path)
        except Exception as e:
            print(f"PDF processing error: {e}")
            return [], 0
    else:
        # It's an image
        # PIL can handle tiff, bmp, webp, convert to jpg/png first if needed
        try:
            img = Image.open(file_path)
            if img.mode != 'RGB':
                img = img.convert('RGB')
            img_path = os.path.join(temp_dir, "input.jpg")
            img.save(img_path, 'JPEG')
            processed_path = preprocess_image(img_path, temp_dir)
            if processed_path:
                processed_paths.append(processed_path)
            os.remove(img_path)
        except Exception as e:
            print(f"Image processing error: {e}")
            return [], 0
            
    return processed_paths, len(processed_paths)
