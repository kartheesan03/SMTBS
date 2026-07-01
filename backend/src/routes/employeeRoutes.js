const express = require('express');
const router = express.Router();
const { getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee, getMe, updateMe } = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, authorize('view_hrms'), getEmployees)
    .post(protect, authorize('manage_hrms'), createEmployee);

router.route('/me')
    .get(protect, getMe)
    .put(protect, updateMe);

router.route('/:id')
    .get(protect, authorize('view_hrms'), getEmployee)
    .put(protect, authorize('manage_hrms'), updateEmployee)
    .delete(protect, authorize('manage_hrms'), deleteEmployee);

module.exports = router;
