const express = require('express');
const router = express.Router();
const { getOrders, createOrder, updateOrderStatus, updatePaymentStatus } = require('../controllers/ordercontroller');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getOrders)
    .post(protect, createOrder);

router.route('/:id/status')
    .put(protect, updateOrderStatus);

router.route('/:id/payment-status')
    .put(protect, updatePaymentStatus);

module.exports = router;
