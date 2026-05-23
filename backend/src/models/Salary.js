const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    month: { type: String, required: true }, // e.g., "April 2026"
    basicSalary: { type: Number, required: true },
    allowances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netSalary: { type: Number, required: true },
    status: { type: String, enum: ['Paid', 'Pending', 'Processing', 'Awaiting Approval', 'Approved'], default: 'Awaiting Approval' },
    paymentDate: { type: Date },
    transactionId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Salary', salarySchema);
