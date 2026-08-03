const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const fs = require('fs');

const IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/bmp',
    'image/webp',
    'image/tiff',
    'image/gif',
];

const extractText = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    const { path: filePath, mimetype, originalname } = req.file;

    try {
        let extractedText = '';

        if (mimetype === 'application/pdf') {
            // ── PDF extraction via pdf-parse v1 ──
            // pdfParse(buffer) returns { text, numpages, info, ... }
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdfParse(dataBuffer);
            extractedText = data.text || '';

        } else if (IMAGE_TYPES.includes(mimetype)) {
            // ── Image OCR via tesseract.js ──
            const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
                logger: () => {}, // suppress progress logs
            });
            extractedText = text || '';

        } else {
            return res.status(400).json({
                success: false,
                error: `Unsupported file type: ${mimetype}`,
            });
        }

        // Clean up the temp file
        try { fs.unlinkSync(filePath); } catch (_) {}

        return res.json({
            success: true,
            text: extractedText.trim() || '(No text detected in this file)',
            filename: originalname,
        });

    } catch (err) {
        // Attempt to clean up even if there was an error
        try { fs.unlinkSync(filePath); } catch (_) {}

        console.error('[OCR] Error:', err.message);
        return res.status(500).json({
            success: false,
            error: err.message || 'OCR processing failed.',
        });
    }
};

module.exports = { extractText };
