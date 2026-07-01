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
router.post('/calculate-deductions', protect, authorize('manage_hrms'), calculatePayrollDeductions);
router.post('/', protect, authorize('manage_hrms'), createSalaryRecord);
router.put('/pay-all', protect, authorize('manage_hrms'), payAllApproved);
router.put('/:id/approve', protect, authorize('manage_hrms'), approveSalaryRecord);
router.put('/:id/pay', protect, authorize('manage_hrms'), paySalaryRecord);
router.put('/:id', protect, authorize('manage_hrms'), updateSalaryRecord);
router.delete('/:id', protect, authorize('manage_hrms'), deleteSalaryRecord);

module.exports = router;
