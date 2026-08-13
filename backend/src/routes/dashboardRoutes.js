const express = require('express');
const router = express.Router();
const { getDashboardStats, getAiInsights } = require('../controllers/dashboardcontroller');
const { protect } = require('../middleware/authMiddleware');
router.get('/stats', protect, getDashboardStats);
router.get('/insights', protect, getAiInsights);
module.exports = router;
