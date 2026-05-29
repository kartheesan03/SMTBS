const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const AttendanceSequelize = sequelize.define('Attendance', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    employeeId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW
    },
    status: {
        type: DataTypes.ENUM('Present', 'Absent', 'Leave', 'Late'),
        defaultValue: 'Present'
    },
    shift: {
        type: DataTypes.ENUM('Day', 'Night'),
        defaultValue: 'Day'
    },
    checkIn: {
        type: DataTypes.STRING,
        allowNull: true
    },
    checkOut: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

const Attendance = makeBridgedModel('Attendance', AttendanceSequelize);
module.exports = Attendance;
