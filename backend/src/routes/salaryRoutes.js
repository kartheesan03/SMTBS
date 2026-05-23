const express = require('express');
const router = express.Router();
const { 
    getMySalaryHistory, 
    getMySalarySummary, 
    createSalaryRecord,
    getAllSalaries,
    approveSalaryRecord
} = require('../controllers/salaryController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/my', protect, getMySalaryHistory);
router.get('/summary', protect, getMySalarySummary);
router.get('/', protect, authorize('Admin', 'HR'), getAllSalaries);
router.post('/', protect, authorize('Admin', 'HR'), createSalaryRecord);
router.put('/:id/approve', protect, authorize('Admin'), approveSalaryRecord);

module.exports = router;
