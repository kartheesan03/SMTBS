import os
import json
import google.generativeai as genai
from PIL import Image

# Initialize Gemini
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Use the latest pro vision model
MODEL_NAME = 'gemini-1.5-pro'

def extract_data(image_paths):
    """
    Extracts structured data from a list of images (pages of a document) using Gemini.
    """
    if not GEMINI_API_KEY:
        # Fallback for local testing if no key is provided
        return _mock_extraction()

    try:
        model = genai.GenerativeModel(MODEL_NAME)
        
        prompt = """
        You are a highly accurate enterprise OCR system. Extract the structured data from the provided document image(s).
        Analyze the document carefully. It may be blurry, have small text, or be skewed.
        
        CRITICAL RULES:
        1. NEVER invent text. If a field is not found or unreadable, mark its value as "Not detected" and confidence as 0.0.
        2. Pay attention to ambiguous characters: 0 vs O, 1 vs I vs l, 5 vs S, 8 vs B, 2 vs Z. Use context to decide.
        3. Extract all distinct line items found in the document (if it's a bill/invoice).
        4. Return ONLY a JSON object exactly matching the structure below. No markdown, no explanations.
        5. For each field, provide a confidence score between 0.0 and 1.0.
        
        {
          "documentType": "invoice|receipt|po|other",
          "confidence": 0.95,
          "fields": {
            "invoiceNumber": { "value": "string", "confidence": 0.98 },
            "invoiceDate": { "value": "string", "confidence": 0.95 },
            "supplierName": { "value": "string", "confidence": 0.99 },
            "gstNumber": { "value": "string", "confidence": 0.90 },
            "totalAmount": { "value": "string", "confidence": 0.97 }
          },
          "items": [
            {
              "description": "string",
              "quantity": "string",
              "unit": "string",
              "rate": "string",
              "tax": "string",
              "total": "string"
            }
          ],
          "rawText": "string containing all raw extracted text for reference"
        }
        """

        # Load all images
        images = [Image.open(path) for path in image_paths]
        
        # Pass prompt and all images to the model
        response = model.generate_content([prompt] + images)
        
        text = response.text.strip()

        
        # Clean up markdown if model still returns it
        if text.startswith('```json'):
            text = text[7:]
        if text.startswith('```'):
            text = text[3:]
        if text.endswith('```'):
            text = text[:-3]
            
        result = json.loads(text.strip())
        return result
        
    except Exception as e:
        print(f"Gemini API Error: {e}")
        raise e

def _mock_extraction():
    # Return mock data for testing if API key is not set
    return {
        "documentType": "invoice",
        "confidence": 0.85,
        "fields": {
            "invoiceNumber": { "value": "INV-MOCK-123", "confidence": 0.98 },
            "invoiceDate": { "value": "2026-08-28", "confidence": 0.95 },
            "supplierName": { "value": "Mock Supplier Ltd", "confidence": 0.99 },
            "gstNumber": { "value": "12345ABCDE", "confidence": 0.80 },
            "totalAmount": { "value": "500.00", "confidence": 0.97 }
        },
        "items": [
            {
                "description": "Mock Item",
                "quantity": "10",
                "unit": "pcs",
                "rate": "50",
                "tax": "10",
                "total": "500"
            }
        ],
        "rawText": "Mock Item 10 pcs 50 10 500\nINV-MOCK-123\nMock Supplier Ltd"
    }
