const express = require('express');
const router = express.Router();
const { getLeads, createLead, updateLead, convertToCustomer, getLeadStats } = require('../controllers/leadcontroller');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/stats')
    .get(protect, getLeadStats);

router.route('/')
    .get(protect, getLeads)
    .post(protect, createLead);

router.route('/:id')
    .put(protect, updateLead);

router.put('/:id/convert', protect, authorize('Admin'), convertToCustomer);

module.exports = router;
