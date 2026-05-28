const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    ticketNumber: { type: String, required: true, unique: true },
    customer: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        refPath: 'customerModel' 
    },
    customerModel: { 
        type: String, 
        required: true, 
        enum: ['Customer', 'Lead'], 
        default: 'Customer' 
    },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    priority: { 
        type: String, 
        enum: ['Low', 'Medium', 'High'], 
        default: 'Medium' 
    },
    status: { 
        type: String, 
        enum: ['Open', 'In Progress', 'Resolved', 'Closed'], 
        default: 'Open' 
    },
    category: {
        type: String,
        enum: ['General', 'Technical', 'Billing', 'Other'],
        default: 'General'
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
