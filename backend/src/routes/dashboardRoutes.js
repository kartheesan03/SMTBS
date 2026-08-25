const express = require('express');
const router = express.Router();
const { 
  getDashboardStats, 
  getAiInsights,
  getOperationalIntelligence, 
  applyOperationalIntelligence,
  getCashFlowForecast,
  applyCashFlowForecast,
  getSystemHealth
} = require('../controllers/dashboardcontroller');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getDashboardStats);
router.get('/insights', protect, getAiInsights);
router.get('/operational-intelligence', protect, getOperationalIntelligence);
router.post('/operational-intelligence/apply', protect, applyOperationalIntelligence);
router.get('/cash-flow-forecast', protect, getCashFlowForecast);
router.post('/cash-flow-forecast/apply', protect, applyCashFlowForecast);
router.get('/system-health', protect, getSystemHealth);

module.exports = router;
