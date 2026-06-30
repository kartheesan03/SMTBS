const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const BackupScheduleSequelize = sequelize.define('BackupSchedule', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    frequency: { type: DataTypes.STRING, defaultValue: 'Daily' },
    time: { type: DataTypes.STRING, defaultValue: '23:00' },
    storage: { type: DataTypes.JSON, defaultValue: { local: true, gdrive: false, onedrive: false, s3: false } },
    enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
    keepLast: { type: DataTypes.STRING, defaultValue: '30 Backups' }
}, { timestamps: true });

module.exports = makeBridgedModel('BackupSchedule', BackupScheduleSequelize);
