const Salary = require('../models/Salary');
const Employee = require('../models/Employee');

// @desc    Get personal salary history
// @route   GET /api/salaries/my
// @access  Private
const getMySalaryHistory = async (req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.user._id });
        if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

        // Only show approved or paid salaries to employees
        const history = await Salary.find({ 
            employee: employee._id,
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
            employee: employee._id,
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

// @desc    Create salary record (HR/Admin)
// @route   POST /api/salaries
// @access  Private/Admin/HR
const createSalaryRecord = async (req, res) => {
    try {
        const { employeeId, month, basicSalary, allowances, deductions } = req.body;
        
        const netSalary = basicSalary + (allowances || 0) - (deductions || 0);
        
        const salary = await Salary.create({
            employee: employeeId,
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
    approveSalaryRecord
};
