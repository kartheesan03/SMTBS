const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, locationController.getLocations);

module.exports = router;
