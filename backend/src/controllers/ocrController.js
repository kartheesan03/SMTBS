const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const getFastApiUrl = () => process.env.OCR_SERVICE_URL || process.env.FASTAPI_URL || 'http://localhost:8000';

const extractText = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    const { path: filePath, originalname } = req.file;

    try {
        // Health Check before sending massive file
        try {
            await axios.get(`${getFastApiUrl()}/health`, { timeout: 3000 });
        } catch (healthErr) {
            console.error('[OCR] Health check failed:', healthErr.message);
            try { fs.unlinkSync(filePath); } catch (_) {}
            return res.status(503).json({
                success: false,
                error: `Python OCR service is unavailable. Please start the OCR service on port 8000.`
            });
        }

        const formData = new FormData();
        const fileBuffer = fs.readFileSync(filePath);
        formData.append('file', fileBuffer, { filename: originalname });

        const response = await axios.post(`${getFastApiUrl()}/api/ocr`, formData, {
            headers: {
                ...formData.getHeaders(),
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 300000 // 5 minutes
        });

        // Clean up the temp file
        try { fs.unlinkSync(filePath); } catch (_) {}

        return res.json(response.data);

    } catch (err) {
        // Attempt to clean up even if there was an error
        try { fs.unlinkSync(filePath); } catch (_) {}

        console.error('[OCR] Error proxying to FastAPI:', err.message);
        let errorMsg = err.response?.data?.detail || err.message || 'OCR processing failed.';
        
        if (err.code === 'ECONNREFUSED' || err.message.includes('ECONNREFUSED')) {
            errorMsg = `Failed to connect to OCR Engine at ${getFastApiUrl()}. Is the Python backend running?`;
        } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
            errorMsg = 'Connection to OCR Engine timed out. The document might be too large or the server is busy.';
        }

        return res.status(500).json({
            success: false,
            error: errorMsg,
        });
    }
};

const exportDocx = async (req, res) => {
    try {
        const queryStr = req.url.split('?')[1] ? `?${req.url.split('?')[1]}` : '';
        const response = await axios.post(`${getFastApiUrl()}/export/docx${queryStr}`, req.body, {
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
        let errorMsg = err.response?.data?.detail || err.message || 'Docx generation failed.';
        if (err.code === 'ECONNREFUSED' || err.message.includes('ECONNREFUSED')) {
            errorMsg = `Failed to connect to OCR Engine at ${getFastApiUrl()}. Is the Python backend running?`;
        } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
            errorMsg = 'Connection to OCR Engine timed out.';
        }
        return res.status(500).json({
            success: false,
            error: errorMsg,
        });
    }
};

const exportTxt = async (req, res) => {
    try {
        const queryStr = req.url.split('?')[1] ? `?${req.url.split('?')[1]}` : '';
        const response = await axios.post(`${getFastApiUrl()}/export/txt${queryStr}`, req.body, {
            responseType: 'stream',
            timeout: 60000
        });

        for (const [key, value] of Object.entries(response.headers)) {
            res.setHeader(key, value);
        }
        
        response.data.pipe(res);
    } catch (err) {
        console.error('[OCR] Error exporting txt:', err.message);
        let errorMsg = err.response?.data?.detail || err.message || 'Txt generation failed.';
        if (err.code === 'ECONNREFUSED' || err.message.includes('ECONNREFUSED')) {
            errorMsg = `Failed to connect to OCR Engine at ${getFastApiUrl()}. Is the Python backend running?`;
        } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
            errorMsg = 'Connection to OCR Engine timed out.';
        }
        return res.status(500).json({
            success: false,
            error: errorMsg,
        });
    }
};

const exportPdf = async (req, res) => {
    try {
        const queryStr = req.url.split('?')[1] ? `?${req.url.split('?')[1]}` : '';
        const response = await axios.post(`${getFastApiUrl()}/export/pdf${queryStr}`, req.body, {
            responseType: 'stream',
            timeout: 60000
        });

        for (const [key, value] of Object.entries(response.headers)) {
            res.setHeader(key, value);
        }
        
        response.data.pipe(res);
    } catch (err) {
        console.error('[OCR] Error exporting pdf:', err.message);
        let errorMsg = err.response?.data?.detail || err.message || 'Pdf generation failed.';
        if (err.code === 'ECONNREFUSED' || err.message.includes('ECONNREFUSED')) {
            errorMsg = `Failed to connect to OCR Engine at ${getFastApiUrl()}. Is the Python backend running?`;
        } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
            errorMsg = 'Connection to OCR Engine timed out.';
        }
        return res.status(500).json({
            success: false,
            error: errorMsg,
        });
    }
};

module.exports = { extractText, exportDocx, exportTxt, exportPdf };
