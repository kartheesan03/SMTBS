const express = require('express');
const router  = express.Router();
const {
    applyLeave, getMyLeaves, cancelLeave,
    getAllLeaves, reviewLeave, getLeaveBalance
} = require('../controllers/leaveController');
const { protect }   = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/balance',     getLeaveBalance);                           // GET  /api/leaves/balance
router.get('/my',          getMyLeaves);                               // GET  /api/leaves/my
router.post('/',           applyLeave);                                // POST /api/leaves
router.put('/:id/cancel',  cancelLeave);                              // PUT  /api/leaves/:id/cancel

// Admin / HR only
router.get('/',            authorize('Admin', 'HR'), getAllLeaves);    // GET  /api/leaves
router.put('/:id/review',  authorize('Admin', 'HR'), reviewLeave);    // PUT  /api/leaves/:id/review

module.exports = router;
