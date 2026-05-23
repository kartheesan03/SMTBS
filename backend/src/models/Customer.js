const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true },
    phone: { type: String },
    company: { type: String },
    address: { type: String },
    industry: { type: String },
    website: { type: String },
    notes: { type: String },
    status: { type: String, enum: ['Active', 'Lead', 'Inactive', 'Pending Review'], default: 'Active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
