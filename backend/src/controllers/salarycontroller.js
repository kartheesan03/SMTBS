const Salary = require('../models/Salary');
const Employee = require('../models/Employee');
const { broadcast, notifyHR } = require('../services/notificationService');

// @desc    Get personal salary history
// @route   GET /api/salaries/my
// @access  Private
const getMySalaryHistory = async (req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.user._id });
        if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

        // Show all salary records to the employee so they can track status
        const history = await Salary.find({ 
            employeeId: employee._id
        }).sort({ createdAt: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get latest salary summary
// @route   GET /api/salaries/summary
// @access  Private
const getMySalarySummary = async (req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.user._id });
        if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

        const latest = await Salary.findOne({ 
            employeeId: employee._id
        }).sort({ createdAt: -1 });

        if (!latest) {
            // No salary record exists at all for this employee
            return res.json({ status: 'Not Generated', message: 'No salary records found' });
        }

        // Derive effective status based on paymentDate for safety
        const effectiveStatus = latest.paymentDate ? 'Paid' : latest.status;
        res.json({ ...latest.toJSON ? latest.toJSON() : latest._doc || latest, status: effectiveStatus });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all salaries (Admin/HR)
// @route   GET /api/salaries
// @access  Private/Admin/HR
const getAllSalaries = async (req, res) => {
    try {
        const salaries = await Salary.find({}).populate({
            path: 'employee',
            populate: { path: 'userId', select: 'name email' }
        }).sort({ createdAt: -1 });
        res.json(salaries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve salary record
// @route   PUT /api/salaries/:id/approve
// @access  Private/Admin
const approveSalaryRecord = async (req, res) => {
    try {
        const salary = await Salary.findById(req.params.id);
        if (salary) {
            salary.status = 'Approved';
            const updatedSalary = await salary.save();

            // Create notification for the employee
            try {
                const employee = await Employee.findById(salary.employeeId);
                if (employee && employee.userId) {
                    const empUserId = employee.userIdField || employee.userId;
                    await broadcast({
                        targetUserId: empUserId,
                        targetOnly: true,
                        title: `Salary Approved: ${salary.month}`,
                        message: `Your salary record for ${salary.month} has been approved.`,
                        type: 'info',
                        category: 'hr'
                    });
                }
            } catch (notifErr) {
                console.error('Error creating approve salary notification:', notifErr.message);
            }

            res.json(updatedSalary);
        } else {
            res.status(404).json({ message: 'Salary record not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Pay salary to employee (mark as Paid)
// @route   PUT /api/salaries/:id/pay
// @access  Private/Admin/HR
const paySalaryRecord = async (req, res) => {
    try {
        const salary = await Salary.findById(req.params.id);
        if (!salary) {
            return res.status(404).json({ message: 'Salary record not found' });
        }

        if (salary.status === 'Paid') {
            return res.status(400).json({ message: 'This salary has already been paid' });
        }

        if (salary.status !== 'Approved') {
            return res.status(400).json({ message: 'Salary must be approved before payment. Current status: ' + salary.status });
        }

        const { paymentMethod, bankRef, notes } = req.body;

        // Generate transaction ID
        const txnId = `TXN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

        salary.status = 'Paid';
        salary.paymentDate = new Date();
        salary.transactionId = txnId;
        
        const updatedSalary = await salary.save();

        // Create notification for the employee
        try {
            const employee = await Employee.findById(salary.employeeId);
            if (employee && employee.userId) {
                const empUserId = employee.userIdField || employee.userId;
                await broadcast({
                    targetUserId: empUserId,
                    targetOnly: true,
                    title: `Salary Paid: ${salary.month}`,
                    message: `Your salary of ₹${salary.netSalary.toLocaleString()} for ${salary.month} has been disbursed. Transaction ID: ${txnId}${paymentMethod ? '. Payment via ' + paymentMethod : ''}.`,
                    type: 'success',
                    category: 'hr'
                });
            }
        } catch (notifErr) {
            console.error('Error creating salary notification:', notifErr.message);
        }

        res.json({
            message: `Salary paid successfully. Transaction ID: ${txnId}`,
            salary: updatedSalary,
            transactionId: txnId
        });
    } catch (error) {
        console.error('paySalaryRecord error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Pay all approved salaries at once (Bulk Pay)
// @route   PUT /api/salaries/pay-all
// @access  Private/Admin/HR
const payAllApproved = async (req, res) => {
    try {
        const approvedSalaries = await Salary.find({ status: 'Approved' })
            .populate({
                path: 'employee',
                populate: { path: 'userId', select: 'name' }
            });

        if (approvedSalaries.length === 0) {
            return res.status(400).json({ message: 'No approved salaries pending payment' });
        }

        let paidCount = 0;
        let totalDisbursed = 0;
        const results = [];

        for (const salary of approvedSalaries) {
            const txnId = `TXN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

            salary.status = 'Paid';
            salary.paymentDate = new Date();
            salary.transactionId = txnId;
            await salary.save();

            paidCount++;
            totalDisbursed += salary.netSalary;
            results.push({
                employeeName: salary.employee?.userId?.name || 'Unknown',
                month: salary.month,
                netSalary: salary.netSalary,
                transactionId: txnId
            });

            // Notify each employee
            try {
                const employee = await Employee.findById(salary.employeeId);
                if (employee && employee.userId) {
                    const empUserId = employee.userIdField || employee.userId;
                    await broadcast({
                        targetUserId: empUserId,
                        targetOnly: true,
                        title: `Salary Paid: ${salary.month}`,
                        message: `Your salary of ₹${salary.netSalary.toLocaleString()} for ${salary.month} has been disbursed. Transaction ID: ${txnId}.`,
                        type: 'success',
                        category: 'hr'
                    });
                }
            } catch (notifErr) {
                console.error('Bulk pay notification error:', notifErr.message);
            }
        }

        res.json({
            message: `${paidCount} salaries paid. Total: ₹${totalDisbursed.toLocaleString()}`,
            paidCount,
            totalDisbursed,
            results
        });
    } catch (error) {
        console.error('payAllApproved error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create salary record (HR/Admin)
// @route   POST /api/salaries
// @access  Private/Admin/HR
const createSalaryRecord = async (req, res) => {
    try {
        const { employeeId, month, basicSalary, allowances, deductions } = req.body;
        
        const netSalary = basicSalary + (allowances || 0) - (deductions || 0);
        
        const salary = await Salary.create({
            employeeId,
            month,
            basicSalary,
            allowances,
            deductions,
            netSalary,
            status: 'Awaiting Approval'
        });
        
        try {
            const employee = await Employee.findById(employeeId);
            if (employee && employee.userId) {
                const empUserId = employee.userIdField || employee.userId;
                const empName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
                
                // 1. Employee notification
                await broadcast({
                    targetUserId: empUserId,
                    targetOnly: true,
                    title: `Salary Processed`,
                    message: `Your salary for ${month} has been processed successfully.`,
                    type: 'info',
                    category: 'hr'
                });

                // 2. HR notification
                await broadcast({
                    targetRoles: ['HR'],
                    exactRoles: true,
                    title: `Salary Processed`,
                    message: `Salary processed for Employee: ${empName} (₹${netSalary.toLocaleString()}).`,
                    type: 'info',
                    category: 'hr'
                });

                // 3. Admin notification
                await broadcast({
                    targetRoles: ['Admin'],
                    exactRoles: true,
                    title: `Payroll Completed`,
                    message: `Payroll completed for ${empName} (${month}).`,
                    type: 'info',
                    category: 'hr'
                });
            }
        } catch (notifErr) {
            console.error('Error creating salary process notifications:', notifErr.message);
        }

        res.status(201).json(salary);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Calculate deductions based on attendance
// @route   POST /api/salaries/calculate-deductions
// @access  Private/Admin/HR
const calculatePayrollDeductions = async (req, res) => {
    try {
        const { employeeId, month, basicSalary } = req.body;
        
        if (!employeeId || !month || !basicSalary) {
            return res.status(400).json({ message: 'employeeId, month, and basicSalary are required' });
        }

        const monthDate = new Date(`${month} 1`);
        if (isNaN(monthDate.getTime())) {
            return res.status(400).json({ message: 'Invalid month format. Expected "Month YYYY"' });
        }
        
        const year = monthDate.getFullYear();
        const monthIndex = monthDate.getMonth();
        const startDate = new Date(year, monthIndex, 1);
        const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
        const daysInMonth = endDate.getDate();

        const Attendance = require('../models/Attendance');
        const attendances = await Attendance.find({
            employeeId,
            date: { $gte: startDate, $lte: endDate }
        });

        let absentDays = 0;
        let lateDays = 0;
        let presentDays = 0;

        attendances.forEach(att => {
            if (att.status === 'Absent') absentDays++;
            else if (att.status === 'Late') lateDays++;
            else if (att.status === 'Present') presentDays++;
        });

        // 3 lates = 1 absent deduction (standard HR policy, optional)
        const totalAbsentEquivalents = absentDays + Math.floor(lateDays / 3);
        const perDaySalary = basicSalary / daysInMonth;
        const suggestedDeduction = Math.round(perDaySalary * totalAbsentEquivalents);

        res.json({
            absentDays,
            lateDays,
            presentDays,
            daysInMonth,
            suggestedDeduction,
            perDaySalary: Math.round(perDaySalary)
        });
    } catch (error) {
        console.error('calculatePayrollDeductions error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMySalaryHistory,
    getMySalarySummary,
    createSalaryRecord,
    getAllSalaries,
    approveSalaryRecord,
    paySalaryRecord,
    payAllApproved,
    calculatePayrollDeductions
};
