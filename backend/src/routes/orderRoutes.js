const express = require('express');
const router = express.Router();
const { getOrders, createOrder, updateOrderStatus, updatePaymentStatus, updateTrackingStatus, getMyCustomerOrders, createCustomerOrder, deleteOrder, employeeApprovePurchaseOrder, cancelCustomerOrder } = require('../controllers/ordercontroller');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getOrders)
    .post(protect, authorize('Admin', 'Manager', 'HR', 'Super Admin'), createOrder);

router.route('/customer')
    .get(protect, getMyCustomerOrders)
    .post(protect, createCustomerOrder);

router.route('/:id/cancel')
    .put(protect, cancelCustomerOrder);

router.route('/:id/status')
    .put(protect, authorize('Admin', 'Manager', 'HR', 'Sales', 'Super Admin'), updateOrderStatus);

router.route('/:id/payment-status')
    .put(protect, authorize('Admin', 'Manager', 'HR', 'Super Admin'), updatePaymentStatus);

router.route('/:id/tracking')
    .put(protect, authorize('Admin', 'Manager', 'Sales', 'HR', 'Super Admin'), updateTrackingStatus);

router.route('/:id/employee-approve')
    .post(protect, authorize('Super Admin', 'Admin', 'Manager', 'HR'), employeeApprovePurchaseOrder);

router.route('/:id')
    .delete(protect, authorize('Admin', 'Manager', 'Super Admin'), deleteOrder);

module.exports = router;
