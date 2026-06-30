const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const Leave = require('../models/Leave');
const Notification = require('../models/Notification');
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
            if (now.getHours() < 14) {
                return res.json({ status: '-', date: today });
            }
            return res.json({ status: '-', date: today });
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
            if (!attendance.status || attendance.status === '-' || attendance.status === 'Not Checked In' || attendance.status === 'Absent') {
                attendance.status = calculatedStatus;
            }
            await attendance.save();
        } else {
            attendance = await Attendance.create({
                userId: req.user._id || req.user.id,
                employeeId: empId,
                role: req.user.role || employee.designation,
                date: today,
                checkIn: checkInTime,
                status: calculatedStatus,
                shift: (new Date(checkInTime).getHours() >= 6 && new Date(checkInTime).getHours() < 18) ? 'Day' : 'Night'
            });
        }

        const finalStatus = attendance.status || calculatedStatus;
        const msg = `${employee.firstName} ${employee.lastName || ''} checked in at ${new Date(checkInTime).toLocaleTimeString()}. Status: ${finalStatus}`;
        const ref = `ATTENDANCE_CHECKIN_${empId}_${today}`;

        // Prevent duplicate Check-In notification using a unique ref
        const recentNotifs = await Notification.find();
        const duplicateExists = recentNotifs.some(n => n.module === 'Attendance' && n.referenceId === ref);

        if (!duplicateExists) {
            await notifyHR({
                module: 'Attendance',
                referenceId: ref,
                title: 'Employee Check-In',
                message: msg,
                type: finalStatus === 'Late' ? 'warning' : 'info'
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

        const msg = `${employee.firstName} ${employee.lastName || ''} checked out at ${new Date(attendance.checkOut).toLocaleTimeString()}.`;
        const ref = `ATTENDANCE_CHECKOUT_${empId}_${today}`;

        // Prevent duplicate Check-Out notification using a unique ref
        const recentNotifs = await Notification.find();
        const duplicateExists = recentNotifs.some(n => n.module === 'Attendance' && n.referenceId === ref);

        if (!duplicateExists) {
            await notifyHR({
                module: 'Attendance',
                referenceId: ref,
                title: 'Employee Check-Out',
                message: msg,
                type: 'info'
            });
        }

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
        const targetDate = req.query.date || new Date().toISOString().split('T')[0];
        
        let query = {};

        // Fetch all employees (since status field doesn't exist in the current schema)
        const employees = await Employee.find(query);

        // Fetch attendance records for targetDate
        const attendances = await Attendance.find({ date: targetDate })
            .sort({ date: -1 });

        // Map employeeId to attendance
        const attendanceMap = {};
        attendances.forEach(att => {
            const empId = att.employeeId?.toString();
            attendanceMap[empId] = att;
        });

        // Fetch leaves for targetDate
        const targetDateObj = new Date(targetDate);
        const dateStart = new Date(targetDateObj);
        dateStart.setHours(0,0,0,0);
        const dateEnd = new Date(targetDateObj);
        dateEnd.setHours(23,59,59,999);
        
        const leaves = await Leave.find({
            startDate: { $lte: dateEnd },
            endDate: { $gte: dateStart },
            status: 'Approved'
        });
        const leaveMap = {};
        leaves.forEach(l => { leaveMap[l.employeeId?.toString()] = true });

        const now = new Date();
        const defaultStatus = '-';

        let presentToday = 0;
        let absentToday = 0;
        let notCheckedInToday = 0;
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
            else if (finalStatus === 'Not Checked In') notCheckedInToday++;
            else if (finalStatus === 'On Leave') onLeaveToday++;

            const employeeData = {
                firstName: emp.firstName,
                lastName: emp.lastName,
                employeeId: emp.employeeId,
                department: emp.department
            };

            if (record) {
                // Attach employee data manually since populate was removed
                const plainRecord = record.toJSON ? record.toJSON() : (record.toObject ? record.toObject() : { ...record });
                plainRecord.employee = employeeData;
                return plainRecord;
            }
            return {
                employeeId: empId,
                date: targetDate,
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
            notCheckedInToday,
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

        // Format to YYYY-MM-DD for DATEONLY string comparison
        const todayStr = todayStart.getFullYear() + '-' + String(todayStart.getMonth() + 1).padStart(2, '0') + '-' + String(todayStart.getDate()).padStart(2, '0');

        // Fetch active employees (all employees in current minimal schema)
        const activeEmployees = await Employee.find({});

        // Fetch today's attendance records
        const attendances = await Attendance.find({
            date: todayStr
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
                    { employeeId: record.employeeId, date: todayStr },
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

// @desc    Get monthly attendance summary for HR reports
// @route   GET /api/attendance/monthly-summary
// @access  Private (Admin/HR)
const getMonthlySummary = async (req, res) => {
    try {
        const { year, month } = req.query;
        const now = new Date();
        const targetYear = year ? parseInt(year) : now.getFullYear();
        const targetMonth = month ? parseInt(month) - 1 : now.getMonth();

        const startDate = new Date(targetYear, targetMonth, 1);
        const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);
        const totalDaysInMonth = endDate.getDate();

        let query = {};

        // Format to YYYY-MM-DD for DATEONLY string comparison
        const formatYYYYMMDD = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        const startDateStr = formatYYYYMMDD(startDate);
        const endDateStr = formatYYYYMMDD(endDate);

        const employees = await Employee.find(query);
        const attendances = await Attendance.find({
            date: { $gte: startDateStr, $lte: endDateStr }
        });
        
        const leaves = await Leave.find({
            status: 'Approved',
            $or: [
                { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
            ]
        });

        const summary = employees.map(emp => {
            const empIdStr = emp._id?.toString() || emp.id?.toString();
            
            const empAttendances = attendances.filter(a => a.employeeId?.toString() === empIdStr);
            const presentDays = empAttendances.filter(a => a.status === 'Present' || a.status === 'Late').length;
            const absentDays = empAttendances.filter(a => a.status === 'Absent').length;
            
            const empLeaves = leaves.filter(l => l.employeeId?.toString() === empIdStr);
            let leaveDays = 0;
            empLeaves.forEach(l => {
                const ls = new Date(l.startDate) < startDate ? startDate : new Date(l.startDate);
                const le = new Date(l.endDate) > endDate ? endDate : new Date(l.endDate);
                const diffTime = Math.abs(le - ls);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                leaveDays += diffDays;
            });

            // Assuming standard working days = total days in month for simplicity, or 22
            // We use a fixed 22 if not specified, or just total minus weekends
            let workDays = 0;
            for(let d=1; d<=totalDaysInMonth; d++) {
                const dt = new Date(targetYear, targetMonth, d);
                if(dt.getDay() !== 0 && dt.getDay() !== 6) workDays++;
            }

            const totalAccounted = presentDays + leaveDays;
            const rate = workDays > 0 ? (totalAccounted / workDays) : 0;

            return {
                id: emp.employeeId,
                name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
                dept: emp.department || 'N/A',
                workDays: workDays,
                present: presentDays,
                absent: absentDays,
                leaves: leaveDays,
                rate: rate > 1 ? 1 : rate
            };
        });

        res.json(summary);
    } catch (error) {
        console.error('getMonthlySummary error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance history with filters
// @route   GET /api/attendance/history
// @access  Private
const getAttendanceHistory = async (req, res) => {
    try {
        const { fromDate, toDate, employeeName, department, status, employeeId } = req.query;
        let query = {};

        // Restrict to employee's own records if they are not an Admin/HR/Manager
        let empIdToFilter = employeeId;
        if (!['Admin', 'HR', 'Manager'].includes(req.user.role)) {
            const employee = await Employee.findOne({ userId: req.user._id });
            if (!employee) return res.json([]);
            empIdToFilter = employee._id || employee.id;
        }

        if (empIdToFilter) {
            query.employeeId = empIdToFilter;
        }

        if (fromDate || toDate) {
            query.date = {};
            if (fromDate) query.date.$gte = fromDate.substring(0, 10);
            if (toDate) query.date.$lte = toDate.substring(0, 10);
        }

        if (status && status !== 'All') {
            query.status = status;
        }

        // We populate employee first to allow filtering by department and employee name
        let attendances = await Attendance.find(query)
            .populate({
                path: 'employee',
                select: 'firstName lastName employeeId department'
            })
            .sort({ date: -1 })
            .lean();

        // Apply employee name and department filters in memory 
        // (Since employee is a referenced document, Mongoose $match inside populate is possible but in-memory is simpler for this scale)
        if (department && department !== 'All') {
            attendances = attendances.filter(a => a.employee?.department === department);
        }

        if (employeeName && employeeName.trim() !== '') {
            const searchLower = employeeName.toLowerCase();
            attendances = attendances.filter(a => {
                const fullName = `${a.employee?.firstName || ''} ${a.employee?.lastName || ''}`.toLowerCase();
                return fullName.includes(searchLower);
            });
        }

        res.json(attendances);
    } catch (error) {
        console.error('getAttendanceHistory error:', error);
        res.status(500).json({ message: error.message });
    }
};


const getUserAttendance = async (req, res) => {
    try {
        const history = await Attendance.find({ userId: req.params.id }).sort({ date: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const editAttendance = async (req, res) => {
    try {
        const { recordId, status, checkInTime, checkOutTime, totalHours } = req.body;
        let attendance = await Attendance.findOne({ _id: recordId }) || await Attendance.findOne({ id: recordId });
        if(!attendance) return res.status(404).json({ message: 'Not found' });
        
        if(status) attendance.status = status;
        if(checkInTime) attendance.checkInTime = checkInTime;
        if(checkOutTime) attendance.checkOutTime = checkOutTime;
        if(totalHours !== undefined) attendance.totalHours = totalHours;
        await attendance.save();
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUserAttendance,
    editAttendance,
    getAttendanceStatus,
    checkIn,
    checkOut,
    getMyAttendanceHistory,
    getAllAttendance,
    autoMarkAbsent,
    getMonthlySummary,
    getAttendanceHistory
};
