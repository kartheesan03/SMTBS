const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const LeaveSequelize = sequelize.define('Leave', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    employeeId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('Annual', 'Sick', 'Casual', 'Unpaid'),
        allowNull: false
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    reason: {
        type: DataTypes.TEXT,
        defaultValue: ''
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Cancelled'),
        defaultValue: 'Pending'
    },
    reviewedById: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    reviewNote: {
        type: DataTypes.TEXT,
        defaultValue: ''
    }
});

const Leave = makeBridgedModel('Leave', LeaveSequelize);
module.exports = Leave;
