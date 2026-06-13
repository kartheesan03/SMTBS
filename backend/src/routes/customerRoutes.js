const express = require('express');
const router = express.Router();
const { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer, approveCustomer, getCustomerOrders, getCustomerTickets, getMyCustomerProfile, createCustomerProfile } = require('../controllers/customercontroller');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getCustomers)
    .post(protect, createCustomer);

router.route('/profile')
    .post(protect, createCustomerProfile);

router.route('/my-profile')
    .get(protect, getMyCustomerProfile);

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
