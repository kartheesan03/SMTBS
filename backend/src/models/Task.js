const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    completions: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' }
    }],
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    dueDate: { type: Date },
    isBroadcast: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
