const express = require('express');
const router = express.Router();
const { getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee, getMe, updateMe } = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, authorize('view_hrms', 'hrms:employeeData:view'), getEmployees)
    .post(protect, authorize('manage_hrms', 'hrms:employeeData:manage'), createEmployee);

router.route('/me')
    .get(protect, getMe)
    .put(protect, updateMe);

router.route('/:id')
    .get(protect, authorize('view_hrms', 'hrms:employeeData:view'), getEmployee)
    .put(protect, authorize('manage_hrms', 'hrms:employeeData:manage'), updateEmployee)
    .delete(protect, authorize('manage_hrms', 'hrms:employeeData:manage'), deleteEmployee);

module.exports = router;
