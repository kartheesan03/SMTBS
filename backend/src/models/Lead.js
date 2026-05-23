const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    name: { type: String, required: true },
    source: { type: String },
    phone: { type: String },
    email: { type: String },
    status: { 
        type: String, 
        enum: ['Awaiting Review', 'Initial Contact', 'Qualified Lead', 'Negotiation', 'Closing Deal', 'Converted to Vendor', 'Lost'], 
        default: 'Awaiting Review' 
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String },
    estimatedValue: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
