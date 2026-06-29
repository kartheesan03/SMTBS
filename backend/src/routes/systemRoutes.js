const express = require('express');
const router = express.Router();
const { getNavigation } = require('../controllers/systemController');
const { protect } = require('../middleware/authMiddleware');

router.get('/navigation', protect, getNavigation);

module.exports = router;
