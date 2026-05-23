const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    type: {
        type: String,
        enum: ['Annual', 'Sick', 'Casual', 'Unpaid'],
        required: true
    },
    startDate: { type: Date, required: true },
    endDate:   { type: Date, required: true },
    reason:    { type: String, default: '' },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
        default: 'Pending'
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewNote: { type: String, default: '' }
}, { timestamps: true });

// Virtual: number of days requested
leaveSchema.virtual('days').get(function () {
    const ms = new Date(this.endDate) - new Date(this.startDate);
    return Math.ceil(ms / 86400000) + 1;
});

module.exports = mongoose.model('Leave', leaveSchema);
