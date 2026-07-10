const mongoose = require('mongoose');

const salesGoalSchema = new mongoose.Schema({
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    period: {
        type: String,
        enum: ['Monthly', 'Quarterly', 'Yearly', 'Custom'],
        default: 'Monthly'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    targetAmount: {
        type: Number,
        default: 0
    },
    targetOrders: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('SalesGoal', salesGoalSchema);
