const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const RestoreLogSequelize = sequelize.define('RestoreLog', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    backupIdField: { type: DataTypes.INTEGER, allowNull: false },
    restoredById: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: 'Success' },
    remarks: { type: DataTypes.STRING }
}, { timestamps: true });

module.exports = makeBridgedModel('RestoreLog', RestoreLogSequelize);
