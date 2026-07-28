import os
import json
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("ANTHROPIC_API_KEY")
client = Anthropic(api_key=api_key)

def extract_structured_data(text: str) -> dict:
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY is not set. Please add it to your .env file.")

    prompt = f"""
    You are an expert AI parser for business documents like Invoices, Purchase Orders, Delivery Challans, Goods Receipt Notes, Material Request Forms, and Inventory Sheets.
    Your task is to take raw OCR text and convert it strictly into a structured JSON response.

    Rules:
    1. Output ONLY valid JSON. Do not include markdown formatting or explanations.
    2. Do NOT hallucinate data. If a field is missing, omit it or set to null.
    3. Infer the "document_type" from the text.
    4. Expected fields if applicable: 
       - document_type
       - vendor_name
       - invoice_number (or po_number, delivery_challan_number, etc depending on type)
       - invoice_date (or document date)
       - materials (list of objects with: name, quantity, unit, price)
       - subtotal
       - gst
       - grand_total

    Raw OCR Text:
    {text}
    """

    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=2048,
        temperature=0.0,
        system="You are an intelligent document parsing system. You return ONLY raw JSON.",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    result_text = response.content[0].text.strip()
    
    # Clean up any potential markdown json blocks if the model ignored the system prompt
    if result_text.startswith("```json"):
        result_text = result_text[7:]
    if result_text.startswith("```"):
        result_text = result_text[3:]
    if result_text.endswith("```"):
        result_text = result_text[:-3]
        
    try:
        return json.loads(result_text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse Claude response as JSON: {result_text}") from e
