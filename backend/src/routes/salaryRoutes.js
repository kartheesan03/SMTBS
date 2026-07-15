const express = require('express');
const router = express.Router();
const { 
    getMySalaryHistory, 
    getMySalarySummary, 
    createSalaryRecord,
    getAllSalaries,
    approveSalaryRecord,
    paySalaryRecord,
    payAllApproved,
    updateSalaryRecord,
    deleteSalaryRecord,
    calculatePayrollDeductions
} = require('../controllers/salarycontroller');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/my', protect, getMySalaryHistory);
router.get('/summary', protect, getMySalarySummary);
router.get('/', protect, getAllSalaries);
router.post('/calculate-deductions', protect, authorize('manage_hrms', 'hrms:payroll:generate'), calculatePayrollDeductions);
router.post('/', protect, authorize('manage_hrms', 'hrms:payroll:generate'), createSalaryRecord);
router.put('/pay-all', protect, authorize('manage_hrms', 'hrms:payroll:manage'), payAllApproved);
router.put('/:id/approve', protect, authorize('manage_hrms', 'hrms:payroll:manage'), approveSalaryRecord);
router.put('/:id/pay', protect, authorize('manage_hrms', 'hrms:payroll:manage'), paySalaryRecord);
router.put('/:id', protect, authorize('manage_hrms', 'hrms:payroll:manage'), updateSalaryRecord);
router.delete('/:id', protect, authorize('manage_hrms', 'hrms:payroll:manage'), deleteSalaryRecord);

module.exports = router;
