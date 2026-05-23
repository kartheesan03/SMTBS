const express = require('express');
const router = express.Router();
const { getVendors, createVendor } = require('../controllers/vendorController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getVendors)
    .post(protect, createVendor);

module.exports = router;
