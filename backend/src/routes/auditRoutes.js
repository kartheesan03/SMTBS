const express = require('express');
const router = express.Router();
const { getAuditLogs, getAuditStats } = require('../controllers/auditcontroller');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, authorize('Admin'), getAuditLogs);
router.get('/stats', protect, authorize('Admin'), getAuditStats);

module.exports = router;
