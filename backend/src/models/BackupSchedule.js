const mongoose = require('mongoose');

const backupScheduleSchema = new mongoose.Schema({
    frequency: { type: String, default: 'Daily' }, // Daily, Weekly, Monthly
    time: { type: String, default: '23:00' },
    storage: {
        local: { type: Boolean, default: true },
        gdrive: { type: Boolean, default: false },
        onedrive: { type: Boolean, default: false },
        s3: { type: Boolean, default: false }
    },
    enabled: { type: Boolean, default: true },
    keepLast: { type: String, default: '30 Backups' }
}, { timestamps: true });

module.exports = mongoose.model('BackupSchedule', backupScheduleSchema);
