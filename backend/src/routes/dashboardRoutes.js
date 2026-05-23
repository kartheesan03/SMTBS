const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardcontroller');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getDashboardStats);

module.exports = router;
