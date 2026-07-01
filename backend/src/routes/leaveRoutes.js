const express = require('express');
const router  = express.Router();
const {
    applyLeave, getMyLeaves, cancelLeave,
    getAllLeaves, reviewLeave, getLeaveBalance
} = require('../controllers/leavecontroller');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/balance',     getLeaveBalance);                           // GET  /api/leaves/balance
router.get('/my',          getMyLeaves);                               // GET  /api/leaves/my
router.post('/',           applyLeave);                                // POST /api/leaves
router.put('/:id/cancel',  cancelLeave);                              // PUT  /api/leaves/:id/cancel

// Admin / HR only
router.get('/',            authorize('manage_hrms'), getAllLeaves);    // GET  /api/leaves
router.put('/:id/review',  authorize('manage_hrms'), reviewLeave);    // PUT  /api/leaves/:id/review

module.exports = router;
