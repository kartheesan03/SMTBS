const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Holiday = sequelize.define('Holiday', {
    id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name:        { type: DataTypes.STRING,  allowNull: false },
    date:        { type: DataTypes.DATEONLY, allowNull: false },
    type:        { type: DataTypes.ENUM('National','Regional','Company','Optional'), defaultValue: 'Company' },
    description: { type: DataTypes.TEXT,   allowNull: true },
    color:       { type: DataTypes.STRING,  defaultValue: '#6366f1' },
    isRecurring: { type: DataTypes.BOOLEAN, defaultValue: false },
    createdBy:   { type: DataTypes.INTEGER, allowNull: true },
});

Holiday.sync({ alter: true }).catch(console.error);

module.exports = Holiday;
