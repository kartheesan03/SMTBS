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
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, authorize('Admin', 'HR', 'Manager'), getAllAttendance);
router.get('/all', protect, authorize('Admin', 'HR', 'Manager'), getAllAttendance); // Alias

router.get('/history', protect, getAttendanceHistory);
router.get('/monthly-summary', protect, authorize('Admin', 'HR', 'Manager'), getMonthlySummary);
router.get('/status', protect, getAttendanceStatus);

router.post('/check-in', protect, checkIn);
router.post('/checkin', protect, checkIn); // Alias

router.post('/check-out', protect, checkOut);
router.post('/checkout', protect, checkOut); // Alias

router.get('/my-history', protect, getMyAttendanceHistory);
router.get('/user/:id', protect, getUserAttendance);

router.put('/edit', protect, authorize('Admin', 'HR'), editAttendance);

module.exports = router;
