const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const os = require('os');
const { extractText } = require('../controllers/ocrController');

// Store uploads in the OS temp directory so we never leave files on disk
const upload = multer({
    dest: os.tmpdir(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
    fileFilter: (_req, file, cb) => {
        const allowed = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/bmp',
            'image/webp', 'image/tiff', 'image/gif',
            'application/pdf',
        ];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Unsupported file type: ${file.mimetype}`));
        }
    },
});

// POST /api/ocr
router.post('/', upload.single('file'), extractText);

module.exports = router;
