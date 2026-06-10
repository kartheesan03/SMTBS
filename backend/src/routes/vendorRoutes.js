const express = require('express');
const router = express.Router();
const { getVendors, createVendor, updateVendor } = require('../controllers/vendorcontroller');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getVendors)
    .post(protect, createVendor);

router.route('/:id')
    .put(protect, updateVendor);

module.exports = router;
