const express = require('express');
const router  = express.Router();
const {
    applyLeave, getMyLeaves, cancelLeave,
    getAllLeaves, reviewLeave, getLeaveBalance
} = require('../controllers/leavecontroller');
const { protect, authorize } = require('../middleware/authMiddleware');
router.use(protect);
router.get('/balance',     getLeaveBalance);
router.get('/my',          getMyLeaves);
router.post('/',           applyLeave);
router.put('/:id/cancel',  cancelLeave);
router.get('/',            authorize('view_hrms', 'manage_hrms', 'hrms:leave:view'), getAllLeaves);
router.put('/:id/review',  authorize('manage_hrms', 'hrms:leave:manage'), reviewLeave);
module.exports = router;
