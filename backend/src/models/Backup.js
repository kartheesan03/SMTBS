const mongoose = require('mongoose');

const backupSchema = new mongoose.Schema({
    backupName: { type: String, required: true },
    backupType: { type: String, required: true }, // 'Full', 'HR', 'Manager', 'Database', 'Files'
    filePath: { type: String, required: true },
    fileSize: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, default: 'Success' }
}, { timestamps: true });

module.exports = mongoose.model('Backup', backupSchema);
