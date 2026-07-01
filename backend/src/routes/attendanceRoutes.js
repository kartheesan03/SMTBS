const express = require('express');
const router = express.Router();
const { 
    getAttendanceStatus, 
    checkIn, 
    checkOut, 
    getMyAttendanceHistory,
    getAllAttendance,
    getMonthlySummary,
    getAttendanceHistory,
    getUserAttendance,
    editAttendance
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('view_attendance'), getAllAttendance);
router.get('/all', protect, authorize('view_attendance'), getAllAttendance); // Alias

router.get('/history', protect, getAttendanceHistory);
router.get('/monthly-summary', protect, authorize('view_attendance'), getMonthlySummary);
router.get('/status', protect, getAttendanceStatus);

router.post('/check-in', protect, checkIn);
router.post('/checkin', protect, checkIn); // Alias

router.post('/check-out', protect, checkOut);
router.post('/checkout', protect, checkOut); // Alias

router.get('/my-history', protect, getMyAttendanceHistory);
router.get('/user/:id', protect, getUserAttendance);

router.put('/edit', protect, authorize('manage_attendance'), editAttendance);

module.exports = router;
