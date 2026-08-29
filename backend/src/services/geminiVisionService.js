/**
 * Gemini Vision Service — Primary OCR engine
 * Uses Google Gemini 1.5 Flash to semantically understand document images.
 * Falls back gracefully when key is absent or rate-limited.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

let genAI = null;

function getClient() {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key.includes('your_gemini_api_key') || key.length < 20) {
        return null;
    }
    if (!genAI) {
        genAI = new GoogleGenerativeAI(key);
    }
    return genAI;
}

// ─────────────────────────────────────────────────────────────────────────────
// The structured extraction prompt sent with every image
// ─────────────────────────────────────────────────────────────────────────────
const EXTRACTION_PROMPT = `You are an expert document analysis AI. Analyze this document image with extreme care.

INSTRUCTIONS:
1. Extract ONLY information that is actually visible in the image. Never invent values.
2. Preserve exact characters: numbers, dates, IDs, amounts, names as shown.
3. If a character is unclear, write "?" in that position rather than guessing.
4. Understand the visual layout: labels, values, tables, headings, totals.
5. Detect the document type: receipt, invoice, form, bank slip, bill, etc.

DOCUMENT STRUCTURE DETECTION:
- If the document has labeled fields (e.g. "Date: 22/08/2026"), extract as Field/Value pairs.
- If the document has a line-item table (products, qty, rate, amount), extract as a proper table with real column headers.
- If it has both sections, return both as separate tables.
- Use the ACTUAL column headers visible in the document. NEVER use "Column 1", "Column 2", etc.

VALIDATION RULES (flag these as warnings, do not auto-correct):
- Dates: Flag any year outside 1990-2035 as suspicious.
- Amounts: Flag if line items don't add up to totals.
- IDs: Flag if partial/truncated (contains "..." or very short).

Return ONLY valid JSON in this exact structure (no markdown, no explanation):
{
  "documentType": "receipt|invoice|bank_slip|form|table|unknown",
  "confidence": 0.0-1.0,
  "tables": [
    {
      "tableName": "Human-readable name like Document Details or Line Items",
      "tableType": "key_value|data_table",
      "columns": ["Field", "Value"],
      "rows": [
        {
          "Field": { "value": "Date", "confidence": 0.95 },
          "Value": { "value": "22/08/2026", "confidence": 0.92 }
        }
      ]
    }
  ],
  "rawText": "Complete verbatim OCR text of the entire document",
  "warnings": [
    "Date '22/08/4040' appears suspicious — year out of expected range",
    "Amount total could not be verified"
  ],
  "pageCount": 1
}

IMPORTANT: tableType "key_value" is for label+value pairs. "data_table" is for multi-row item tables.
If the document is a receipt/bill, the first table should be "Document Details" (key_value).
If it has line items, add a second table "Line Items" (data_table).`;

// ─────────────────────────────────────────────────────────────────────────────
// Main Gemini Vision function
// ─────────────────────────────────────────────────────────────────────────────
async function analyzeWithGemini(imagePath) {
    const client = getClient();
    if (!client) {
        return { available: false, reason: 'No Gemini API key configured' };
    }

    try {
        // Read image and convert to base64
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');

        // Detect MIME type from extension
        const ext = path.extname(imagePath).toLowerCase().replace('.', '');
        const mimeMap = {
            jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
            webp: 'image/webp', gif: 'image/gif', bmp: 'image/png', // bmp -> convert first
        };
        const mimeType = mimeMap[ext] || 'image/jpeg';

        const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const result = await model.generateContent([
            {
                inlineData: {
                    data: base64Image,
                    mimeType: mimeType
                }
            },
            { text: EXTRACTION_PROMPT }
        ]);

        let responseText = result.response.text().trim();

        // Strip markdown code fences if present
        responseText = responseText
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/\s*```$/i, '')
            .trim();

        let parsed;
        try {
            parsed = JSON.parse(responseText);
        } catch (parseErr) {
            // Try to extract JSON from response if it has surrounding text
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsed = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error(`Gemini returned non-JSON: ${responseText.substring(0, 200)}`);
            }
        }

        // Validate structure
        if (!parsed.tables || !Array.isArray(parsed.tables)) {
            parsed.tables = [];
        }

        // Ensure each table has required fields
        parsed.tables = parsed.tables.map((table, i) => ({
            tableName: table.tableName || (i === 0 ? 'Document Details' : `Table ${i + 1}`),
            tableType: table.tableType || 'key_value',
            columns: table.columns || [],
            rows: (table.rows || []).map(row => {
                // Normalize row — ensure each cell has { value, confidence }
                const normalized = {};
                (table.columns || []).forEach(col => {
                    const cell = row[col];
                    if (typeof cell === 'string') {
                        normalized[col] = { value: cell, confidence: 0.8 };
                    } else if (cell && typeof cell === 'object') {
                        normalized[col] = {
                            value: String(cell.value ?? ''),
                            confidence: Number(cell.confidence ?? 0.8)
                        };
                    } else {
                        normalized[col] = { value: '', confidence: 0.5 };
                    }
                });
                return normalized;
            })
        }));

        return {
            available: true,
            success: true,
            documentType: parsed.documentType || 'unknown',
            confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0.8)),
            tables: parsed.tables,
            rawText: parsed.rawText || '',
            warnings: parsed.warnings || [],
            pageCount: parsed.pageCount || 1,
            source: 'gemini'
        };

    } catch (err) {
        console.error('[GeminiVision] Error:', err.message);

        // Check for auth error
        if (err.message?.includes('API_KEY_INVALID') || err.message?.includes('403')) {
            return { available: false, reason: 'Invalid Gemini API key' };
        }
        if (err.message?.includes('RESOURCE_EXHAUSTED') || err.message?.includes('429')) {
            return { available: false, reason: 'Gemini rate limit — using fallback' };
        }

        return { available: true, success: false, error: err.message };
    }
}

module.exports = { analyzeWithGemini, isGeminiAvailable: () => getClient() !== null };
