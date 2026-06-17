const express = require('express');
const router = express.Router();
const { 
    getAttendanceStatus, 
    checkIn, 
    checkOut, 
    getMyAttendanceHistory,
    getAllAttendance,
    getMonthlySummary,
    getAttendanceHistory
} = require('../controllers/attendancecontroller');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, authorize('Admin', 'HR', 'Manager'), getAllAttendance);
router.get('/history', protect, getAttendanceHistory);
router.get('/monthly-summary', protect, authorize('Admin', 'HR', 'Manager'), getMonthlySummary);
router.get('/status', protect, getAttendanceStatus);
router.post('/check-in', protect, checkIn);
router.post('/check-out', protect, checkOut);
router.get('/my-history', protect, getMyAttendanceHistory);

module.exports = router;
