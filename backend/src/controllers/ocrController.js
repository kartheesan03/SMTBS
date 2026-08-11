const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

const extractText = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    const { path: filePath, originalname } = req.file;

    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath), originalname);

        const response = await axios.post(`${FASTAPI_URL}/api/ocr`, formData, {
            headers: {
                ...formData.getHeaders(),
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 120000 // 2 minutes
        });

        // Clean up the temp file
        try { fs.unlinkSync(filePath); } catch (_) {}

        return res.json(response.data);

    } catch (err) {
        // Attempt to clean up even if there was an error
        try { fs.unlinkSync(filePath); } catch (_) {}

        console.error('[OCR] Error proxying to FastAPI:', err.message);
        return res.status(500).json({
            success: false,
            error: err.response?.data?.detail || err.message || 'OCR processing failed.',
        });
    }
};

const exportDocx = async (req, res) => {
    try {
        const queryStr = req.url.split('?')[1] ? `?${req.url.split('?')[1]}` : '';
        const response = await axios.post(`${FASTAPI_URL}/export/docx${queryStr}`, req.body, {
            responseType: 'stream',
            timeout: 60000
        });

        // Proxy all headers
        for (const [key, value] of Object.entries(response.headers)) {
            res.setHeader(key, value);
        }
        
        response.data.pipe(res);
    } catch (err) {
        console.error('[OCR] Error exporting docx:', err.message);
        return res.status(500).json({
            success: false,
            error: err.response?.data?.detail || err.message || 'Docx generation failed.',
        });
    }
};

const exportTxt = async (req, res) => {
    try {
        const queryStr = req.url.split('?')[1] ? `?${req.url.split('?')[1]}` : '';
        const response = await axios.post(`${FASTAPI_URL}/export/txt${queryStr}`, req.body, {
            responseType: 'stream',
            timeout: 60000
        });

        for (const [key, value] of Object.entries(response.headers)) {
            res.setHeader(key, value);
        }
        
        response.data.pipe(res);
    } catch (err) {
        console.error('[OCR] Error exporting txt:', err.message);
        return res.status(500).json({
            success: false,
            error: err.response?.data?.detail || err.message || 'Txt generation failed.',
        });
    }
};

const exportPdf = async (req, res) => {
    try {
        const queryStr = req.url.split('?')[1] ? `?${req.url.split('?')[1]}` : '';
        const response = await axios.post(`${FASTAPI_URL}/export/pdf${queryStr}`, req.body, {
            responseType: 'stream',
            timeout: 60000
        });

        for (const [key, value] of Object.entries(response.headers)) {
            res.setHeader(key, value);
        }
        
        response.data.pipe(res);
    } catch (err) {
        console.error('[OCR] Error exporting pdf:', err.message);
        return res.status(500).json({
            success: false,
            error: err.response?.data?.detail || err.message || 'Pdf generation failed.',
        });
    }
};

module.exports = { extractText, exportDocx, exportTxt, exportPdf };
