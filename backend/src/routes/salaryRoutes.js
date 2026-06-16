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
    deleteSalaryRecord
} = require('../controllers/salarycontroller');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/my', protect, getMySalaryHistory);
router.get('/summary', protect, getMySalarySummary);
router.get('/', protect, authorize('Admin', 'HR'), getAllSalaries);
router.post('/calculate-deductions', protect, authorize('Admin', 'HR'), calculatePayrollDeductions);
router.post('/', protect, authorize('Admin', 'HR'), createSalaryRecord);
router.put('/pay-all', protect, authorize('Admin', 'HR'), payAllApproved);
router.put('/:id/approve', protect, authorize('Admin'), approveSalaryRecord);
router.put('/:id/pay', protect, authorize('Admin', 'HR'), paySalaryRecord);
router.put('/:id', protect, authorize('Admin', 'HR'), updateSalaryRecord);
router.delete('/:id', protect, authorize('Admin', 'HR'), deleteSalaryRecord);

module.exports = router;
