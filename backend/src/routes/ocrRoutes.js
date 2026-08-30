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

module.exports = router;
