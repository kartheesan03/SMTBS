const express = require('express');
const router = express.Router();
const { getOrders, updateOrderStatus, updatePaymentStatus } = require('../controllers/ordercontroller');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getOrders);

router.route('/:id/status')
    .put(protect, updateOrderStatus);

router.route('/:id/payment-status')
    .put(protect, updatePaymentStatus);

module.exports = router;
