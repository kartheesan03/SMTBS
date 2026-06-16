const express = require('express');
const router = express.Router();
const { getOrders, createOrder, updateOrderStatus, updatePaymentStatus, updateTrackingStatus, getMyCustomerOrders, createCustomerOrder } = require('../controllers/ordercontroller');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getOrders)
    .post(protect, authorize('Admin', 'Manager', 'Super Admin'), createOrder);

router.route('/customer')
    .get(protect, getMyCustomerOrders)
    .post(protect, createCustomerOrder);

router.route('/:id/status')
    .put(protect, updateOrderStatus);

router.route('/:id/payment-status')
    .put(protect, updatePaymentStatus);

router.route('/:id/tracking')
    .put(protect, authorize('Admin', 'Manager', 'Sales'), updateTrackingStatus);

module.exports = router;
