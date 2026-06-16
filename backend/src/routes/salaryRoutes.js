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
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/my', protect, getMySalaryHistory);
router.get('/summary', protect, getMySalarySummary);
router.get('/', protect, getAllSalaries);
router.post('/calculate-deductions', protect, authorize('Admin', 'HR', 'Manager'), calculatePayrollDeductions);
router.post('/', protect, authorize('Admin', 'HR', 'Manager'), createSalaryRecord);
router.put('/pay-all', protect, authorize('Admin', 'HR', 'Manager'), payAllApproved);
router.put('/:id/approve', protect, authorize('Admin', 'Manager'), approveSalaryRecord);
router.put('/:id/pay', protect, authorize('Admin', 'HR', 'Manager'), paySalaryRecord);
router.put('/:id', protect, authorize('Admin', 'HR', 'Manager'), updateSalaryRecord);
router.delete('/:id', protect, authorize('Admin', 'HR', 'Manager'), deleteSalaryRecord);

module.exports = router;
