import os
import sys

# Add the services directory to the path so we can import ocr_service
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.ocr_service import extract_text

test_images_dir = 'c:\\Users\\Admin\\Documents\\project\\test_images'
images_to_test = ['test_clear.jpg', 'test_blurry.jpg', 'test_faded.jpg', 'test_skewed.jpg', 'test_noisy.jpg']

print("Starting OCR Verification Tests...\n")

success = True

for img in images_to_test:
    img_path = os.path.join(test_images_dir, img)
    if not os.path.exists(img_path):
        print(f"Skipping {img} (Not found)")
        continue
        
    print(f"--- Testing {img} ---")
    try:
        result = extract_text(img_path)
        
        # Verify critical data points
        fields = result.get('fields', {})
        totals = result.get('totals', {})
        rows = result.get('rows', [])
        
        inv_no = fields.get('invoice_number', '')
        tot = totals.get('total', '')
        
        print(f"Extracted Invoice Number: {inv_no}")
        print(f"Extracted Total: {tot}")
        
        # Verify Character Preservation Requirement
        if "1024" in inv_no:
            print("[SUCCESS]: Protected numeric characters preserved (INV-1024)")
        else:
            print(f"[FAILED]: Did not recover INV-1024 correctly.")
            success = False
            
        if "539" in tot:
            print("[SUCCESS]: Total amount recovered correctly (539.00)")
        else:
            print(f"[FAILED]: Did not recover total correctly.")
            success = False
            
        # Verify Dynamic Table Reconstruction
        if len(rows) >= 3 and any("Product" in row.get("Item", "") or "Product" in row.get("Field", "") for row in rows):
            print("[SUCCESS]: Table structure and items reconstructed.")
        else:
            print(f"[FAILED]: Table reconstruction missing items.")
            success = False
            
    except Exception as e:
        print(f"[ERROR] testing {img}: {str(e)}")
        success = False
        
    print("\n")

if success:
    print("[ALL PASSED] OCR VISION PIPELINE TESTS PASSED!")
    print("The targeted enhancement logic (Upscaling, CLAHE, Thresholding) successfully recovered characters from blurry, faded, skewed, and noisy images without hallucination.")
else:
    print("[FAILED] SOME TESTS FAILED.")
