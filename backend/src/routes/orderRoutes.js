const express = require('express');
const router = express.Router();
const { getOrders, createOrder, updateOrderStatus, updatePaymentStatus, updateTrackingStatus, getMyCustomerOrders, createCustomerOrder, deleteOrder, employeeApprovePurchaseOrder, cancelCustomerOrder, getLiveLocation, flagAsDelayed } = require('../controllers/ordercontroller');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getOrders)
    .post(protect, authorize('manage_crm'), createOrder);

router.route('/customer')
    .get(protect, getMyCustomerOrders)
    .post(protect, createCustomerOrder);

router.route('/:id/cancel')
    .put(protect, cancelCustomerOrder);

router.route('/:id/status')
    .put(protect, authorize('manage_crm', 'manage_inventory'), updateOrderStatus);

router.route('/:id/payment-status')
    .put(protect, authorize('manage_crm'), updatePaymentStatus);

router.route('/:id/tracking')
    .put(protect, authorize('manage_crm', 'manage_inventory'), updateTrackingStatus);

router.route('/:id/employee-approve')
    .post(protect, authorize('manage_crm'), employeeApprovePurchaseOrder);

router.get('/:id/location', protect, getLiveLocation);

router.put('/:id/delay', protect, flagAsDelayed);

router.route('/:id')
    .delete(protect, authorize('manage_crm'), deleteOrder);

module.exports = router;
