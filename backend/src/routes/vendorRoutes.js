const express = require('express');
const router = express.Router();
const { getVendors, getVendorById, createVendor, updateVendor, getMyVendorProfile, createVendorProfile, deleteVendor, getVendorMaterials } = require('../controllers/vendorcontroller');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, authorize('view_materials', 'view_erp'), getVendors)
    .post(protect, authorize('manage_materials', 'manage_erp'), createVendor);

router.route('/profile')
    .post(protect, createVendorProfile);

router.route('/my-profile')
    .get(protect, getMyVendorProfile);

router.route('/:id/materials')
    .get(protect, authorize('view_materials', 'view_erp'), getVendorMaterials);

router.route('/:id')
    .get(protect, authorize('view_materials', 'view_erp'), getVendorById)
    .put(protect, authorize('manage_materials', 'manage_erp'), updateVendor)
    .delete(protect, authorize('manage_materials', 'manage_erp'), deleteVendor);

module.exports = router;
