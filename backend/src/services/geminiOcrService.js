const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Ensure GEMINI_API_KEY exists in env
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error('Missing GEMINI_API_KEY in environment variables.');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Helper to determine mime type for Gemini
 */
function getMimeType(filePath) {
    const ext = filePath.split('.').pop().toLowerCase();
    switch (ext) {
        case 'png': return 'image/png';
        case 'jpeg':
        case 'jpg': return 'image/jpeg';
        case 'webp': return 'image/webp';
        case 'heic': return 'image/heic';
        case 'pdf': return 'application/pdf';
        default: return 'image/jpeg';
    }
}

/**
 * Main OCR Extraction using Gemini 1.5 Flash
 * Instructed to strictly return JSON.
 */
async function processDocumentWithGemini(filePath) {
    if (!genAI) {
        throw new Error('GEMINI_API_KEY is not configured in backend.');
    }

    try {
        const mimeType = getMimeType(filePath);
        
        // Read file to base64
        const fileContent = fs.readFileSync(filePath);
        const base64Content = fileContent.toString('base64');
        
        const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

        const prompt = `You are a professional enterprise Document OCR and Structured Data Extraction System. 
Analyze the provided document and extract its contents into a strict JSON format.

INSTRUCTIONS:
1. Identify the Document Type (e.g. Invoice, Receipt, Purchase Order, Bill).
2. Extract Vendor, Invoice, and Customer details (only what is clearly visible).
3. Reconstruct Line Items as a precise dynamic table. Do NOT use generic column names like "Column 1". Use the exact headers found in the document (e.g. "Description", "HSN", "Quantity", "Rate", "Tax", "Amount"). Preserve the relationships accurately. If the document is a receipt (like a POS printout) that lists key-value pairs (e.g. "TXN NO", "VEHICLE NO", "PRESET", "NOZZLE NO") instead of traditional tabular items, extract EVERY key-value pair as a row in the line_items table, using "Field" and "Value" as the columns.
4. Extract Totals (Subtotal, Tax components like CGST/SGST/IGST, Discount, Grand Total).
5. Extract the complete, raw, unedited text of the entire document into the "raw_text" field. Do not summarize; include everything exactly as it appears.
6. Add a "field_confidence" block listing any fields that are blurry, faded, or uncertain as having "needs_verification: true". Do NOT invent or guess missing characters. 

RETURN STRICTLY A SINGLE JSON OBJECT (NO MARKDOWN WRAPPERS) WITH THIS EXACT STRUCTURE:
{
    "document_type": "string",
    "raw_text": "string",
    "vendor": { "name": "string", "address": "string", "gstin": "string", "phone": "string", "email": "string" },
    "invoice": { "number": "string", "date": "string", "due_date": "string", "po_number": "string", "currency": "string" },
    "customer": { "name": "string", "billing_address": "string", "shipping_address": "string", "gstin": "string" },
    "line_items": {
        "columns": ["string"],
        "rows": [
            { "column_name1": "value", "column_name2": "value" }
        ]
    },
    "totals": { "subtotal": "string", "cgst": "string", "sgst": "string", "igst": "string", "discount": "string", "grand_total": "string" },
    "field_confidence": {
        "field_name_example": { "needs_verification": true, "reason": "Text is blurry" }
    }
}

If a field is not found, leave it as an empty string. If the document has no table, leave columns and rows empty. DO NOT wrap the output in \`\`\`json. Return ONLY valid raw JSON.`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Content,
                    mimeType: mimeType
                }
            }
        ]);

        const responseText = result.response.text();
        
        // Clean markdown block if the model included it despite instructions
        let cleanJson = responseText.trim();
        if (cleanJson.startsWith('\`\`\`json')) {
            cleanJson = cleanJson.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
        } else if (cleanJson.startsWith('\`\`\`')) {
            cleanJson = cleanJson.replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '');
        }

        const structuredData = JSON.parse(cleanJson);
        
        // Map back to the expected OCR format for the controller
        return {
            success: true,
            structured_doc: structuredData,
            ...structuredData,
            fingerprint: `${structuredData.vendor?.name || ''}_${structuredData.invoice?.number || ''}_${structuredData.totals?.grand_total || ''}`,
            confidence: 0.95, // Gemini is typically very confident, rely on field_confidence
            processed_image_base64: null, // Removed entirely as per new design
            warnings: Object.keys(structuredData.field_confidence || {}).length > 0 
                      ? ['Some fields require manual verification due to blur/uncertainty.'] 
                      : []
        };
    } catch (error) {
        console.error('Gemini OCR Error:', error);
        throw new Error(`Generative AI OCR failed: ${error.message}`);
    }
}

module.exports = {
    processDocumentWithGemini
};
