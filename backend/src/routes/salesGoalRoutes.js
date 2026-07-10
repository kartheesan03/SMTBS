const express = require('express');
const router = express.Router();
const {
    getSalesGoals,
    createSalesGoal,
    updateSalesGoal,
    getGoalProgress
} = require('../controllers/salesGoalController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/progress', protect, getGoalProgress);

router.route('/')
    .get(protect, getSalesGoals)
    .post(protect, authorize('manage_crm', 'view_crm'), createSalesGoal);

router.route('/:id')
    .put(protect, authorize('manage_crm', 'view_crm'), updateSalesGoal);

module.exports = router;
