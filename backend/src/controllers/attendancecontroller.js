const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// @desc    Get Current Attendance Status for logged in employee
// @route   GET /api/attendance/status
// @access  Private
const getAttendanceStatus = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format for DATEONLY

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

        const empId = employee._id || employee.id;
        const attendance = await Attendance.findOne({
            employeeId: empId,
            date: today
        });

        if (!attendance) {
            return res.json({ status: 'Absent', date: today });
        }
        res.json(attendance);
    } catch (error) {
        console.error('getAttendanceStatus error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check-in for the day
// @route   POST /api/attendance/check-in
// @access  Private
const checkIn = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

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

        const empId = employee._id || employee.id;
        let attendance = await Attendance.findOne({
            employeeId: empId,
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
            // Determine status based on check-in time (late after 9:00 AM)
            const checkInDate = new Date(checkInTime);
            const lateThreshold = new Date();
            lateThreshold.setHours(9, 0, 0, 0); // 9:00 AM threshold
            const status = checkInDate > lateThreshold ? 'Late' : 'Present';
            attendance = await Attendance.create({
                employeeId: empId,
                date: today,
                checkIn: checkInTime,
                status: status,
                // Determine shift: Day (06:00-18:00) or Night
                shift: (new Date(checkInTime).getHours() >= 6 && new Date(checkInTime).getHours() < 18) ? 'Day' : 'Night'
            });
        }

        res.status(201).json(attendance);
    } catch (error) {
        console.error('checkIn error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check-out for the day
// @route   POST /api/attendance/check-out
// @access  Private
const checkOut = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        let employee = await Employee.findOne({ userId: req.user._id });
        if (!employee) {
            return res.status(404).json({ message: 'Employee profile not found. Please check in first.' });
        }

        const empId = employee._id || employee.id;
        const attendance = await Attendance.findOne({
            employeeId: empId,
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
        console.error('checkOut error:', error);
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

        const empId = employee._id || employee.id;
        const history = await Attendance.find({ employeeId: empId })
            .sort({ date: -1 })
            .limit(30);

        res.json(history);
    } catch (error) {
        console.error('getMyAttendanceHistory error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all attendance for all employees (Admin/HR/Manager)
// @route   GET /api/attendance
// @access  Private
const getAllAttendance = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        // Fetch all employees
        const employees = await Employee.findAll({ attributes: ['id', 'firstName', 'lastName'] });
        // Fetch attendance records for today
        const attendances = await Attendance.find({ date: today })
            .populate({
                path: 'employee',
                select: 'firstName lastName employeeId'
            })
            .sort({ date: -1 });
        // Map employeeId to attendance
        const attendanceMap = {};
        attendances.forEach(att => {
            const empId = att.employeeId?.toString();
            attendanceMap[empId] = att;
        });
        // Build result list including absent employees
        const result = employees.map(emp => {
            const empId = emp._id?.toString() || emp.id?.toString();
            if (attendanceMap[empId]) {
                return attendanceMap[empId];
            }
            return {
                employeeId: empId,
                date: today,
                status: 'Absent',
                employee: {
                    firstName: emp.firstName,
                    lastName: emp.lastName,
                    employeeId: emp.employeeId
                }
            };
        });
        res.json(result);
    } catch (error) {
        console.error('getAllAttendance error:', error);
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
