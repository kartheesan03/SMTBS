const express = require('express');
const router = express.Router();
const { getVendors, getVendorById, createVendor, updateVendor, getMyVendorProfile, createVendorProfile, deleteVendor, getVendorMaterials } = require('../controllers/vendorcontroller');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, authorize('Manager', 'Sales', 'Employee'), getVendors)
    .post(protect, authorize('Manager'), createVendor);

router.route('/profile')
    .post(protect, createVendorProfile);

router.route('/my-profile')
    .get(protect, getMyVendorProfile);

router.route('/:id/materials')
    .get(protect, authorize('Manager', 'Sales', 'Employee', 'Admin', 'Super Admin'), getVendorMaterials);

router.route('/:id')
    .get(protect, authorize('Manager', 'Sales', 'Employee'), getVendorById)
    .put(protect, authorize('Manager'), updateVendor)
    .delete(protect, authorize('Admin'), deleteVendor);

module.exports = router;
