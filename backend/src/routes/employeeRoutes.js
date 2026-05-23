const express = require('express');
const router = express.Router();
const { getEmployees, createEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
    .get(protect, authorize('Admin', 'HR', 'Manager'), getEmployees)
    .post(protect, authorize('Admin', 'HR'), createEmployee);

router.route('/:id')
    .put(protect, authorize('Admin', 'HR'), updateEmployee)
    .delete(protect, authorize('Admin', 'HR'), deleteEmployee);

module.exports = router;
