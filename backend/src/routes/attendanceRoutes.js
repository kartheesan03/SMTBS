const express = require('express');
const router = express.Router();
const { 
    getAttendanceStatus, 
    checkIn, 
    checkOut, 
    getMyAttendanceHistory,
    getAllAttendance
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, authorize('Admin', 'HR', 'Manager'), getAllAttendance);
router.get('/status', protect, getAttendanceStatus);
router.post('/check-in', protect, checkIn);
router.post('/check-out', protect, checkOut);
router.get('/my-history', protect, getMyAttendanceHistory);

module.exports = router;
