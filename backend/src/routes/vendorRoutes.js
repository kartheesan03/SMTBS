const express = require('express');
const router = express.Router();
const { getVendors, getVendorById, createVendor, updateVendor } = require('../controllers/vendorcontroller');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, authorize('Manager', 'Sales'), getVendors)
    .post(protect, authorize('Manager'), createVendor);

router.route('/:id')
    .get(protect, authorize('Manager', 'Sales'), getVendorById)
    .put(protect, authorize('Manager'), updateVendor);

module.exports = router;
