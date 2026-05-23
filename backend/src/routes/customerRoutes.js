const express = require('express');
const router = express.Router();
const { getCustomers, createCustomer, updateCustomer, deleteCustomer, approveCustomer } = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getCustomers)
    .post(protect, createCustomer);

router.route('/:id')
    .put(protect, updateCustomer)
    .delete(protect, deleteCustomer);

router.route('/:id/approve')
    .put(protect, approveCustomer);

module.exports = router;
