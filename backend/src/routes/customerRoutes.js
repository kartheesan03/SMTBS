const express = require('express');
const router = express.Router();
const { getCustomers, getMyCustomerProfile, getCustomerById, createCustomer, updateCustomer, deleteCustomer, approveCustomer, getCustomerOrders, getCustomerTickets } = require('../controllers/customercontroller');
const { protect } = require('../middleware/authMiddleware');

router.route('/me')
    .get(protect, getMyCustomerProfile);

router.route('/')
    .get(protect, getCustomers)
    .post(protect, createCustomer);

router.route('/:id')
    .get(protect, getCustomerById)
    .put(protect, updateCustomer)
    .delete(protect, deleteCustomer);

router.route('/:id/approve')
    .put(protect, approveCustomer);

router.route('/:id/orders')
    .get(protect, getCustomerOrders);

router.route('/:id/tickets')
    .get(protect, getCustomerTickets);

module.exports = router;
