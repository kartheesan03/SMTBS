const express = require('express');
const router = express.Router();
const { getLeads, createLead, updateLead, convertToVendor } = require('../controllers/leadController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
    .get(protect, getLeads)
    .post(protect, createLead);

router.route('/:id')
    .put(protect, updateLead);

router.put('/:id/convert', protect, authorize('Admin'), convertToVendor);

module.exports = router;
