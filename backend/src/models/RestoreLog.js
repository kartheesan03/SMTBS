const mongoose = require('mongoose');

const restoreLogSchema = new mongoose.Schema({
    backupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Backup', required: true },
    restoredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, default: 'Success' },
    remarks: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('RestoreLog', restoreLogSchema);
