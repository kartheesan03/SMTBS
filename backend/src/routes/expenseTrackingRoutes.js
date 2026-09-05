const express = require('express');
const router = express.Router();
const { getDashboardData, getTransactionDetails } = require('../controllers/expenseTrackingController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getDashboardData);
router.get('/transaction/:id', protect, getTransactionDetails);

module.exports = router;
