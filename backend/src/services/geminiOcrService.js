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
        
        const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

        const prompt = `You are a professional enterprise Document OCR and Structured Data Extraction System. 
Analyze the provided document and extract its contents into a strict JSON format.

CRITICAL CHARACTER-LEVEL RECOVERY REQUIREMENT:
The most important requirement is accurate CHARACTER-LEVEL recovery.
When text is blurry, faded, very small, faint, distorted, noisy, or partially unclear, you must NOT simply guess the complete word based on context.
You must inspect the ACTUAL visible character shapes in the image.
Determine the most likely character based on the actual visual evidence.
Preserve the original spelling, capitalization, numbers, punctuation, and spacing exactly.
DO NOT GUESS A WORD ONLY BECAUSE IT IS COMMON OR EXPECTED. If a character cannot be reliably distinguished between C / G then mark that character as uncertain in the structured result (e.g. INVOI[C/G]E).
Preserve the exact position of every character (e.g., preserve leading zeros).
Pay special attention to confusions like 0/O, 1/I/l, 2/Z, 5/S, 6/G, 8/B, 9/g, 3/8, 4/A, 7/T.
Use document context to VALIDATE OCR results, but never use context to invent unreadable characters. The actual image must remain the primary source of truth.

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

        if (!responseText || responseText.trim() === '') {
            throw new Error('Gemini returned an empty response (image may be blocked by safety filters).');
        }
        
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

/**
 * Ask a specific question about a document
 */
async function askDocumentQuestion(filePath, question, ocrContext = null) {
    if (!genAI) {
        throw new Error('GEMINI_API_KEY is not configured in backend.');
    }

    try {
        const mimeType = getMimeType(filePath);
        const fileContent = fs.readFileSync(filePath);
        const base64Content = fileContent.toString('base64');
        
        const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

        let prompt = `You are an AI Document Assistant. Please answer the user's question based on the provided document image.\n`;
        if (ocrContext && ocrContext.raw_text) {
            prompt += `\nHere is the raw extracted text from the document for your reference:\n"""\n${ocrContext.raw_text}\n"""\n`;
        }
        prompt += `\nUser Question: ${question}\n\nAnswer clearly and concisely based ONLY on the document provided. Do not use markdown wrappers unless necessary.`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Content,
                    mimeType: mimeType
                }
            }
        ]);

        return result.response.text().trim();
    } catch (error) {
        console.error('Error in askDocumentQuestion:', error);
        throw error;
    }
}

module.exports = {
    processDocumentWithGemini,
    askDocumentQuestion
};
