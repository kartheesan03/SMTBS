const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const Leave = require('../models/Leave');
const { notifyHR } = require('../services/notificationService');

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
            const todayStart = new Date();
            todayStart.setHours(0,0,0,0);
            const todayEnd = new Date();
            todayEnd.setHours(23,59,59,999);
            
            const leave = await Leave.findOne({
                employeeId: empId,
                startDate: { $lte: todayEnd },
                endDate: { $gte: todayStart },
                status: 'Approved'
            });

            if (leave) {
                return res.json({ status: 'On Leave', date: today });
            }

            const now = new Date();
            const istOffset = 5.5 * 60 * 60 * 1000;
            const istTime = new Date(now.getTime() + istOffset);
            if (istTime.getUTCHours() < 18) {
                return res.json({ status: 'Pending', date: today });
            }
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

        const checkInDate = new Date(checkInTime);
        const lateThreshold = new Date();
        lateThreshold.setHours(9, 0, 59, 999); // 09:00 AM = Present, 09:01 AM and later = Late
        const calculatedStatus = checkInDate > lateThreshold ? 'Late' : 'Present';

        if (attendance) {
            attendance.checkIn = checkInTime;
            if (!attendance.status || attendance.status === 'Pending' || attendance.status === 'Absent') {
                attendance.status = calculatedStatus;
            }
            await attendance.save();
        } else {
            attendance = await Attendance.create({
                employeeId: empId,
                date: today,
                checkIn: checkInTime,
                status: calculatedStatus,
                shift: (new Date(checkInTime).getHours() >= 6 && new Date(checkInTime).getHours() < 18) ? 'Day' : 'Night'
            });
        }

        const finalStatus = attendance.status || calculatedStatus;

        await notifyHR({
            title: 'Employee Check-In',
            message: `${employee.firstName} ${employee.lastName || ''} checked in at ${new Date(checkInTime).toLocaleTimeString()}. Status: ${finalStatus}`,
            type: finalStatus === 'Late' ? 'warning' : 'info'
        });

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

        await notifyHR({
            title: 'Employee Check-Out',
            message: `${employee.firstName} ${employee.lastName || ''} checked out at ${new Date(attendance.checkOut).toLocaleTimeString()}.`,
            type: 'info'
        });

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
        // Fetch all employees (since status field doesn't exist in the current schema)
        const employees = await Employee.find({}).select('id firstName lastName department employeeId');

        // Fetch attendance records for today
        const attendances = await Attendance.find({ date: today })
            .populate({
                path: 'employee',
                select: 'firstName lastName employeeId department'
            })
            .sort({ date: -1 });

        // Map employeeId to attendance
        const attendanceMap = {};
        attendances.forEach(att => {
            const empId = att.employeeId?.toString();
            attendanceMap[empId] = att;
        });

        const todayStart = new Date();
        todayStart.setHours(0,0,0,0);
        const todayEnd = new Date();
        todayEnd.setHours(23,59,59,999);
        
        const leaves = await Leave.find({
            startDate: { $lte: todayEnd },
            endDate: { $gte: todayStart },
            status: 'Approved'
        });
        const leaveMap = {};
        leaves.forEach(l => { leaveMap[l.employeeId?.toString()] = true });

        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istTime = new Date(now.getTime() + istOffset);
        const defaultStatus = istTime.getUTCHours() < 18 ? 'Pending' : 'Absent';

        let presentToday = 0;
        let absentToday = 0;
        let pendingToday = 0;
        let onLeaveToday = 0;
        const totalEmployees = employees.length;

        // Build result list including absent employees
        const result = employees.map(emp => {
            const empId = emp._id?.toString() || emp.id?.toString();
            let finalStatus = defaultStatus;
            let record = null;
            
            if (attendanceMap[empId]) {
                record = attendanceMap[empId];
                finalStatus = record.status;
            } else if (leaveMap[empId]) {
                finalStatus = 'On Leave';
            }
            
            if (finalStatus === 'Present' || finalStatus === 'Late') presentToday++;
            else if (finalStatus === 'Absent') absentToday++;
            else if (finalStatus === 'Pending') pendingToday++;
            else if (finalStatus === 'On Leave') onLeaveToday++;

            if (record) {
                return record;
            }
            return {
                employeeId: empId,
                date: today,
                status: finalStatus,
                employee: {
                    firstName: emp.firstName,
                    lastName: emp.lastName,
                    employeeId: emp.employeeId,
                    department: emp.department
                }
            };
        });

        res.json({
            totalEmployees,
            presentToday,
            pendingToday,
            absentToday,
            onLeaveToday,
            employeeAttendanceList: result
        });
    } catch (error) {
        console.error('getAllAttendance error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Auto-mark absent logic (background task)
const autoMarkAbsent = async () => {
    try {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const todayStart = new Date(now);
        todayStart.setHours(0,0,0,0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23,59,59,999);

        // Fetch active employees (all employees in current minimal schema)
        const activeEmployees = await Employee.find({});

        // Fetch today's attendance records
        const attendances = await Attendance.find({
            date: { $gte: todayStart, $lte: todayEnd }
        });
        const attendedEmpIds = attendances.map(a => a.employeeId?.toString());

        // Fetch today's approved leaves
        const leaves = await Leave.find({
            startDate: { $lte: todayEnd },
            endDate: { $gte: todayStart },
            status: 'Approved'
        });
        const onLeaveEmpIds = leaves.map(l => l.employeeId?.toString());

        // Determine who to mark absent
        const absentRecords = [];
        for (const emp of activeEmployees) {
            const empId = emp._id?.toString() || emp.id?.toString();
            if (!attendedEmpIds.includes(empId) && !onLeaveEmpIds.includes(empId)) {
                absentRecords.push({
                    employeeId: empId,
                    date: todayStart,
                    status: 'Absent',
                    checkIn: null,
                    checkOut: null
                });
            }
        }

        if (absentRecords.length > 0) {
            // Bulk insert or avoid duplicates
            for (const record of absentRecords) {
                await Attendance.updateOne(
                    { employeeId: record.employeeId, date: { $gte: todayStart, $lte: todayEnd } },
                    { $setOnInsert: record },
                    { upsert: true }
                );
            }
            console.log(`Auto-marked ${absentRecords.length} employees as Absent for today.`);
        }
    } catch (err) {
        console.error('autoMarkAbsent error:', err);
    }
};

module.exports = {
    getAttendanceStatus,
    checkIn,
    checkOut,
    getMyAttendanceHistory,
    getAllAttendance,
    autoMarkAbsent
};
