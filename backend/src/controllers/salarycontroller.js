const Salary = require('../models/Salary');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');

// @desc    Get personal salary history
// @route   GET /api/salaries/my
// @access  Private
const getMySalaryHistory = async (req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.user._id });
        if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

        // Only show approved or paid salaries to employees
        const history = await Salary.find({ 
            employeeId: employee._id,
            status: { $in: ['Approved', 'Paid'] }
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
            employeeId: employee._id,
            status: { $in: ['Approved', 'Paid'] }
        }).sort({ createdAt: -1 });
        res.json(latest || { message: 'No salary records found' });
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
                // Get the user field - handle both bridged proxy and raw value
                const empUserId = employee.userIdField || employee.userId;
                await Notification.create({
                    userId: empUserId,
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
                    await Notification.create({
                        userId: empUserId,
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
        
        res.status(201).json(salary);
    } catch (error) {
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
    payAllApproved
};
