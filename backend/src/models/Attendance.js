const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: Date, default: () => new Date().setHours(0,0,0,0) },
    status: { type: String, enum: ['Present', 'Absent', 'Leave', 'Late'], default: 'Present' },
    checkIn: { type: String },
    checkOut: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
