const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const BackupSequelize = sequelize.define('Backup', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    backupName: { type: DataTypes.STRING, allowNull: false },
    backupType: { type: DataTypes.STRING, allowNull: false },
    filePath: { type: DataTypes.STRING, allowNull: false },
    fileSize: { type: DataTypes.STRING },
    createdById: { type: DataTypes.INTEGER },
    status: { type: DataTypes.STRING, defaultValue: 'Success' }
}, { timestamps: true });

module.exports = makeBridgedModel('Backup', BackupSequelize);
