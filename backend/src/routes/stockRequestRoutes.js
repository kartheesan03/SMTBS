const express = require('express');
const router = express.Router();
const { createRequest, getRequests, managerAction, employeeReceive, salesUpdate } = require('../controllers/stockRequestController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('manage_materials'), createRequest)
    .get(protect, getRequests);

router.put('/:id/manager-action', protect, authorize('manage_materials'), managerAction);
router.put('/:id/employee-receive', protect, authorize('manage_materials'), employeeReceive);
router.put('/:id/sales-update', protect, authorize('manage_materials'), salesUpdate);

module.exports = router;
