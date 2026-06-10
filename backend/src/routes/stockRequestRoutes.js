const express = require('express');
const router = express.Router();
const { createRequest, getRequests, managerAction, employeeApproval, salesUpdate } = require('../controllers/stockRequestController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
    .post(protect, authorize('Employee', 'Manager', 'Admin'), createRequest)
    .get(protect, getRequests);

router.put('/:id/manager-action', protect, authorize('Manager', 'Admin'), managerAction);
router.put('/:id/employee-approval', protect, authorize('Employee', 'Admin'), employeeApproval);
router.put('/:id/sales-update', protect, authorize('Sales', 'Admin'), salesUpdate);

module.exports = router;
