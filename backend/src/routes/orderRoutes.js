const express = require('express');
const router = express.Router();
const { getOrders, createOrder, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getOrders)
    .post(protect, createOrder);

router.route('/:id/status')
    .put(protect, updateOrderStatus);

module.exports = router;
