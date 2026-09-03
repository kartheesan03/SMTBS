const express = require('express');
const router = express.Router();
const ocrController = require('../controllers/ocrController');
const { protect } = require('../middleware/authMiddleware');

router.post('/upload', protect, ocrController.uploadDocument);
router.get('/', protect, ocrController.getAllDocuments);
router.get('/:id', protect, ocrController.getDocumentById);
router.put('/:id', protect, ocrController.updateDocument);
router.post('/:id/approve', protect, ocrController.approveDocument);
router.post('/:id/reject', protect, ocrController.rejectDocument);
router.post('/:id/reprocess', protect, ocrController.reprocessDocument);
router.post('/:id/ask', protect, ocrController.askQuestion);

// New enterprise routes
router.get('/:id/audit', protect, ocrController.getAuditLog);
router.get('/:id/export/word', protect, ocrController.exportWord);
router.get('/:id/export/pdf', protect, ocrController.exportPdf);
router.post('/:id/export/word', protect, ocrController.exportWord);
router.post('/:id/export/pdf', protect, ocrController.exportPdf);

module.exports = router;
