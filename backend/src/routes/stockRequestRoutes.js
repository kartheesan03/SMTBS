const express = require('express');
const router = express.Router();
const { createRequest, getRequests, managerAction, employeeReceive, salesUpdate } = require('../controllers/stockRequestController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
    .post(protect, authorize('Employee', 'Manager', 'Admin'), createRequest)
    .get(protect, getRequests);

router.put('/:id/manager-action', protect, authorize('Manager', 'Admin', 'Employee'), managerAction);
router.put('/:id/employee-receive', protect, authorize('Employee', 'Admin'), employeeReceive);
router.put('/:id/sales-update', protect, authorize('Sales', 'Admin'), salesUpdate);

module.exports = router;
