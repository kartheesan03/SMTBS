const express = require('express');
const router = express.Router();
const { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer, approveCustomer, getCustomerOrders, getCustomerTickets, getMyCustomerProfile, createCustomerProfile, updateMyCustomerProfile } = require('../controllers/customercontroller');
const { protect, authorize } = require('../middleware/authMiddleware');
router.route('/')
    .get(protect, getCustomers)
    .post(protect, authorize('manage_crm'), createCustomer);
router.route('/profile')
    .get(protect, getMyCustomerProfile)
    .put(protect, updateMyCustomerProfile)
    .post(protect, createCustomerProfile);
router.route('/:id')
    .get(protect, getCustomerById)
    .put(protect, authorize('manage_crm'), updateCustomer)
    .delete(protect, (req, res, next) => {
        // Enforce Admin only for delete
        const uRole = req.user.role ? req.user.role.toLowerCase() : '';
        if (uRole === 'admin' || uRole === 'super admin' || req.user.email === 'admin@smtbms.com') {
            return next();
        }
        return res.status(403).json({ message: 'Access Denied: Only Admins can delete customers.' });
    }, deleteCustomer);
router.route('/:id/approve')
    .put(protect, approveCustomer);
router.route('/:id/orders')
    .get(protect, getCustomerOrders);
router.route('/:id/tickets')
    .get(protect, getCustomerTickets);
module.exports = router;
