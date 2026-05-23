const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    employeeId: { type: String, unique: true, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String },
    department: { type: String },
    designation: { type: String },
    salary: { type: Number },
    joinDate: { type: Date, default: Date.now },
    contact: { type: String },
    address: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
