const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const os = require('os');
const { extractText, exportDocx, exportTxt, exportPdf } = require('../controllers/ocrController');

const upload = multer({
    dest: os.tmpdir(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
    fileFilter: (_req, file, cb) => {
        const allowed = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/bmp',
            'image/webp', 'image/tiff', 'image/gif', 'image/jfif',
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
        ];

        const fileExt = file.originalname ? file.originalname.split('.').pop().toLowerCase() : '';
        const validExtensions = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'tiff', 'tif', 'bmp', 'webp', 'gif', 'jfif'];

        if (allowed.includes(file.mimetype) || validExtensions.includes(fileExt)) {
            cb(null, true);
        } else {
            cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', `Unsupported file type (ext: ${fileExt})`));
        }
    },
});

const handleUpload = (req, res, next) => {
    const uploadSingle = upload.single('file');
    uploadSingle(req, res, (err) => {
        if (err) {
            return res.status(400).json({ success: false, error: err.message || 'File upload error' });
        }
        next();
    });
};

// POST /api/ocr/extract
router.post('/extract', handleUpload, extractText);

// POST /api/ocr/export/docx
router.post('/export/docx', exportDocx);

// POST /api/ocr/export/txt
router.post('/export/txt', exportTxt);

// POST /api/ocr/export/pdf
router.post('/export/pdf', exportPdf);

module.exports = router;
