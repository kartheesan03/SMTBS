const express = require('express');
const router = express.Router();
const { getERPStats } = require('../controllers/erpcontroller');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getERPStats);

module.exports = router;
