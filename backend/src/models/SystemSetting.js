const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const SystemSettingSequelize = sequelize.define('SystemSetting', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    settingKey: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    settingValue: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true,
    freezeTableName: true
});

const SystemSetting = makeBridgedModel('SystemSetting', SystemSettingSequelize);
module.exports = SystemSetting;
