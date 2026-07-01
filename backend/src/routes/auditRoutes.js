const express = require('express');
const router = express.Router();
const { getAuditLogs, getAuditStats } = require('../controllers/auditcontroller');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('view_audit_logs'), getAuditLogs);
router.get('/stats', protect, authorize('view_audit_logs'), getAuditStats);

module.exports = router;
