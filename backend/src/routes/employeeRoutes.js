const express = require('express');
const router = express.Router();
const { getEmployees, createEmployee, updateEmployee, deleteEmployee, getMe, updateMe } = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
    .get(protect, authorize('Admin', 'HR', 'Manager'), getEmployees)
    .post(protect, authorize('Admin', 'HR'), createEmployee);

router.route('/me')
    .get(protect, getMe)
    .put(protect, updateMe);

router.route('/:id')
    .put(protect, authorize('Admin', 'HR'), updateEmployee)
    .delete(protect, authorize('Admin', 'HR'), deleteEmployee);

module.exports = router;
