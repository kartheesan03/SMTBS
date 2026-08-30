import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import os
import sys

output_dir = 'c:\\Users\\Admin\\Documents\\project\\test_images'
os.makedirs(output_dir, exist_ok=True)

def create_base_invoice() -> str:
    # Create a white image
    img = Image.new('RGB', (800, 1000), color=(255, 255, 255))
    d = ImageDraw.Draw(img)
    
    try:
        font = ImageFont.truetype("arial.ttf", 20)
        font_large = ImageFont.truetype("arial.ttf", 36)
        font_small = ImageFont.truetype("arial.ttf", 12)
    except:
        font = ImageFont.load_default()
        font_large = font
        font_small = font

    # Header
    d.text((50, 50), "SMTBMS Solutions Ltd", fill=(0,0,0), font=font_large)
    d.text((50, 100), "123 Tech Park, Silicon Valley", fill=(0,0,0), font=font)
    
    # Invoice Details
    d.text((500, 50), "INVOICE", fill=(0,0,0), font=font_large)
    d.text((500, 100), "INV-1024", fill=(0,0,0), font=font)
    d.text((500, 130), "Date: 22/08/2026", fill=(0,0,0), font=font)
    
    # Customer
    d.text((50, 200), "Bill To:", fill=(0,0,0), font=font)
    d.text((50, 230), "ABC Traders", fill=(0,0,0), font=font)
    
    # Table Header
    y = 350
    d.line([(50, y), (750, y)], fill=(0,0,0), width=2)
    d.text((50, y+10), "Item", fill=(0,0,0), font=font)
    d.text((350, y+10), "Qty", fill=(0,0,0), font=font)
    d.text((450, y+10), "Rate", fill=(0,0,0), font=font)
    d.text((650, y+10), "Amount", fill=(0,0,0), font=font)
    d.line([(50, y+40), (750, y+40)], fill=(0,0,0), width=2)
    
    # Table Rows
    items = [
        ("Product A", "2", "100.00", "200.00"),
        ("Product B", "1", "250.00", "250.00"),
        ("Service Fee", "1", "40.00", "40.00")
    ]
    
    y += 50
    for item in items:
        d.text((50, y), item[0], fill=(0,0,0), font=font)
        d.text((350, y), item[1], fill=(0,0,0), font=font)
        d.text((450, y), item[2], fill=(0,0,0), font=font)
        d.text((650, y), item[3], fill=(0,0,0), font=font)
        y += 30
        
    d.line([(50, y), (750, y)], fill=(0,0,0), width=1)
    
    # Totals
    y += 20
    d.text((450, y), "Subtotal:", fill=(0,0,0), font=font)
    d.text((650, y), "490.00", fill=(0,0,0), font=font)
    
    y += 30
    d.text((450, y), "Tax (10%):", fill=(0,0,0), font=font)
    d.text((650, y), "49.00", fill=(0,0,0), font=font)
    
    y += 40
    d.text((450, y), "TOTAL:", fill=(0,0,0), font=font_large)
    d.text((650, y), "539.00", fill=(0,0,0), font=font_large)
    
    # Small footer
    d.text((50, 900), "Thank you for your business. Terms and conditions apply.", fill=(0,0,0), font=font_small)
    
    # Save base image
    base_path = os.path.join(output_dir, 'test_clear.jpg')
    img.save(base_path)
    return base_path

def apply_blur(image_path: str):
    img = cv2.imread(image_path)
    if img is None: return
    blurred = cv2.GaussianBlur(img, (9, 9), 0)
    cv2.imwrite(os.path.join(output_dir, 'test_blurry.jpg'), blurred)

def apply_fade(image_path: str):
    img = cv2.imread(image_path)
    if img is None: return
    img_float = img.astype(float)
    # Decrease contrast and increase brightness to simulate fading
    faded = cv2.convertScaleAbs(img_float, alpha=0.3, beta=200)
    cv2.imwrite(os.path.join(output_dir, 'test_faded.jpg'), faded)

def apply_skew(image_path: str):
    img = cv2.imread(image_path)
    if img is None: return
    (h, w) = img.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, 12, 1.0)
    rotated = cv2.warpAffine(img, M, (w, h), borderValue=(255, 255, 255))
    cv2.imwrite(os.path.join(output_dir, 'test_skewed.jpg'), rotated)

def apply_noise(image_path: str):
    img = cv2.imread(image_path)
    if img is None: return
    row, col, ch = img.shape
    s_vs_p = 0.5
    amount = 0.04
    noisy = np.copy(img)
    
    # Salt mode
    num_salt = np.ceil(amount * img.size * s_vs_p)
    coords = [np.random.randint(0, i - 1, int(num_salt)) for i in img.shape]
    noisy[tuple(coords)] = 255
    
    # Pepper mode
    num_pepper = np.ceil(amount * img.size * (1. - s_vs_p))
    coords = [np.random.randint(0, i - 1, int(num_pepper)) for i in img.shape]
    noisy[tuple(coords)] = 0
    cv2.imwrite(os.path.join(output_dir, 'test_noisy.jpg'), noisy)

if __name__ == "__main__":
    base_img = create_base_invoice()
    apply_blur(base_img)
    apply_fade(base_img)
    apply_skew(base_img)
    apply_noise(base_img)
    print("Test images generated successfully in test_images directory.")
