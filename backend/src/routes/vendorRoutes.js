const express = require('express');
const router = express.Router();
const { getVendors, createVendor, updateVendor, getMyVendorProfile } = require('../controllers/vendorcontroller');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/me')
    .get(protect, getMyVendorProfile);

router.route('/')
    .get(protect, authorize('Manager', 'Sales'), getVendors)
    .post(protect, authorize('Manager'), createVendor);

router.route('/:id')
    .put(protect, authorize('Manager'), updateVendor);

module.exports = router;
