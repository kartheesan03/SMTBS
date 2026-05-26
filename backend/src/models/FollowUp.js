const mongoose = require('mongoose');

const followupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { 
        type: String, 
        enum: ['Call', 'Email', 'Meeting'], 
        default: 'Call' 
    },
    time: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Completed', 'Overdue'], 
        default: 'Pending' 
    },
    phone: { type: String },
    email: { type: String },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('FollowUp', followupSchema);
