const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// @desc    Get Current Attendance Status for logged in employee
// @route   GET /api/attendance/status
// @access  Private
const getAttendanceStatus = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find employee linked to this user
        let employee = await Employee.findOne({ userId: req.user._id });
        if (!employee) {
            // Auto-create basic employee profile if missing
            employee = await Employee.create({
                userId: req.user._id,
                employeeId: `EMP${Date.now().toString().slice(-6)}`,
                firstName: req.user.name.split(' ')[0] || 'Employee',
                lastName: req.user.name.split(' ').slice(1).join(' ') || 'User',
                department: 'General',
                designation: req.user.role || 'Staff'
            });
        }

        const attendance = await Attendance.findOne({
            employee: employee._id,
            date: today
        });

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check-in for the day
// @route   POST /api/attendance/check-in
// @access  Private
const checkIn = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let employee = await Employee.findOne({ userId: req.user._id });
        if (!employee) {
            employee = await Employee.create({
                userId: req.user._id,
                employeeId: `EMP${Date.now().toString().slice(-6)}`,
                firstName: req.user.name.split(' ')[0] || 'Employee',
                lastName: req.user.name.split(' ').slice(1).join(' ') || 'User',
                department: 'General',
                designation: req.user.role || 'Staff'
            });
        }

        let attendance = await Attendance.findOne({
            employee: employee._id,
            date: today
        });

        if (attendance && attendance.checkIn) {
            return res.status(400).json({ message: 'Already checked in today' });
        }

        const checkInTime = new Date().toISOString();

        if (attendance) {
            attendance.checkIn = checkInTime;
            await attendance.save();
        } else {
            attendance = await Attendance.create({
                employee: employee._id,
                date: today,
                checkIn: checkInTime,
                status: 'Present'
            });
        }

        res.status(201).json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check-out for the day
// @route   POST /api/attendance/check-out
// @access  Private
const checkOut = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let employee = await Employee.findOne({ userId: req.user._id });
        if (!employee) {
            return res.status(404).json({ message: 'Employee profile not found. Please check in first.' });
        }

        const attendance = await Attendance.findOne({
            employee: employee._id,
            date: today
        });

        if (!attendance || !attendance.checkIn) {
            return res.status(400).json({ message: 'Must check in before checking out' });
        }

        if (attendance.checkOut) {
            return res.status(400).json({ message: 'Already checked out today' });
        }

        attendance.checkOut = new Date().toISOString();
        await attendance.save();

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get personal attendance history
// @route   GET /api/attendance/my-history
// @access  Private
const getMyAttendanceHistory = async (req, res) => {
    try {
        let employee = await Employee.findOne({ userId: req.user._id });
        if (!employee) {
            return res.json([]); // Return empty history if no profile
        }

        const history = await Attendance.find({ employee: employee._id })
            .sort({ date: -1 })
            .limit(30);

        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all attendance for all employees (Admin/HR/Manager)
// @route   GET /api/attendance
// @access  Private
const getAllAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({})
            .populate({
                path: 'employee',
                populate: { path: 'userId', select: 'name email' }
            })
            .sort({ date: -1 });

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAttendanceStatus,
    checkIn,
    checkOut,
    getMyAttendanceHistory,
    getAllAttendance
};
