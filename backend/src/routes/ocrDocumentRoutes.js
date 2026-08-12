const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const ocrDocumentController = require('../controllers/ocrDocumentController');

// GET /api/ocr-documents/summary (MUST be before /:id)
router.get('/summary', protect, ocrDocumentController.getOcrSummary);

// GET /api/ocr-documents
router.get('/', protect, ocrDocumentController.getOcrDocuments);

// GET /api/ocr-documents/:id
router.get('/:id', protect, ocrDocumentController.getOcrDocumentById);

// POST /api/ocr-documents
router.post('/', protect, ocrDocumentController.createOcrDocument);

// PUT /api/ocr-documents/:id
router.put('/:id', protect, ocrDocumentController.updateOcrDocument);

module.exports = router;
