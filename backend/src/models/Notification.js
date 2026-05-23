const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null = global/admin
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: ['warning', 'info', 'success', 'error'],
        default: 'info'
    },
    category: {
        type: String,
        enum: ['stock', 'hr', 'order', 'system', 'general'],
        default: 'general'
    },
    isRead: { type: Boolean, default: false },
    link: { type: String, default: null }, // optional navigation link
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
