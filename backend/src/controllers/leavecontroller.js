const Leave    = require('../models/Leave');
const Employee = require('../models/Employee');

// Helper: get or auto-create employee profile for logged-in user
const getEmployee = async (user) => {
    let emp = await Employee.findOne({ userId: user._id });
    if (!emp) {
        emp = await Employee.create({
            userId:      user._id,
            employeeId:  `EMP${Date.now().toString().slice(-6)}`,
            firstName:   user.name.split(' ')[0] || 'Employee',
            lastName:    user.name.split(' ').slice(1).join(' ') || '',
            department:  'General',
            designation: user.role || 'Staff'
        });
    }
    return emp;
};

// @desc  Apply for leave
// @route POST /api/leaves
// @access Private
const applyLeave = async (req, res) => {
    try {
        const { type, startDate, endDate, reason } = req.body;
        if (!type || !startDate || !endDate)
            return res.status(400).json({ message: 'type, startDate and endDate are required.' });

        const start = new Date(startDate);
        const end   = new Date(endDate);
        if (end < start)
            return res.status(400).json({ message: 'End date must be on or after start date.' });

        const employee = await getEmployee(req.user);

        // Prevent overlapping active requests
        const conflict = await Leave.findOne({
            employee: employee._id,
            status:   { $in: ['Pending', 'Approved'] },
            startDate: { $lte: end },
            endDate:   { $gte: start }
        });
        if (conflict)
            return res.status(400).json({ message: 'You already have a leave request covering these dates.' });

        const leave = await Leave.create({ employee: employee._id, type, startDate: start, endDate: end, reason });
        res.status(201).json(leave);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc  Get my leave requests (employee)
// @route GET /api/leaves/my
// @access Private
const getMyLeaves = async (req, res) => {
    try {
        const employee = await getEmployee(req.user);
        const leaves = await Leave.find({ employee: employee._id }).sort({ createdAt: -1 });
        res.json(leaves);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc  Cancel a pending leave request
// @route PUT /api/leaves/:id/cancel
// @access Private
const cancelLeave = async (req, res) => {
    try {
        const employee = await getEmployee(req.user);
        const leave = await Leave.findOne({ _id: req.params.id, employee: employee._id });
        if (!leave)        return res.status(404).json({ message: 'Leave request not found.' });
        if (leave.status !== 'Pending')
            return res.status(400).json({ message: 'Only pending requests can be cancelled.' });

        leave.status = 'Cancelled';
        await leave.save();
        res.json(leave);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc  Get ALL leave requests (Admin / HR)
// @route GET /api/leaves
// @access Private (Admin, HR)
const getAllLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find()
            .populate({ path: 'employee', populate: { path: 'userId', select: 'name email' } })
            .sort({ createdAt: -1 });
        res.json(leaves);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc  Approve or Reject a leave request (Admin / HR)
// @route PUT /api/leaves/:id/review
// @access Private (Admin, HR)
const reviewLeave = async (req, res) => {
    try {
        const { status, reviewNote } = req.body;
        if (!['Approved', 'Rejected'].includes(status))
            return res.status(400).json({ message: 'Status must be Approved or Rejected.' });

        const leave = await Leave.findById(req.params.id);
        if (!leave) return res.status(404).json({ message: 'Leave request not found.' });
        if (leave.status !== 'Pending')
            return res.status(400).json({ message: 'Only pending requests can be reviewed.' });

        leave.status     = status;
        leave.reviewedBy = req.user._id;
        leave.reviewNote = reviewNote || '';
        await leave.save();
        res.json(leave);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc  Get leave balance summary for current employee
// @route GET /api/leaves/balance
// @access Private
const getLeaveBalance = async (req, res) => {
    try {
        const employee = await getEmployee(req.user);
        const year = new Date().getFullYear();
        const start = new Date(`${year}-01-01`);
        const end   = new Date(`${year}-12-31`);

        const approved = await Leave.find({
            employee: employee._id,
            status: 'Approved',
            startDate: { $gte: start, $lte: end }
        });

        const used = {
            Annual: 0, Sick: 0, Casual: 0, Unpaid: 0
        };

        approved.forEach(l => {
            const days = Math.ceil((new Date(l.endDate) - new Date(l.startDate)) / 86400000) + 1;
            if (used[l.type] !== undefined) used[l.type] += days;
        });

        const total = { Annual: 18, Sick: 10, Casual: 6, Unpaid: 99 };

        res.json({
            balance: {
                Annual:  { total: total.Annual,  used: used.Annual,  remaining: Math.max(0, total.Annual  - used.Annual)  },
                Sick:    { total: total.Sick,    used: used.Sick,    remaining: Math.max(0, total.Sick    - used.Sick)    },
                Casual:  { total: total.Casual,  used: used.Casual,  remaining: Math.max(0, total.Casual  - used.Casual)  },
                Unpaid:  { total: total.Unpaid,  used: used.Unpaid,  remaining: Math.max(0, total.Unpaid  - used.Unpaid)  }
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { applyLeave, getMyLeaves, cancelLeave, getAllLeaves, reviewLeave, getLeaveBalance };
