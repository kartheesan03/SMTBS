const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const AttendanceSequelize = sequelize.define('Attendance', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    employeeId: { // Keeping for backward compatibility temporarily if needed
        type: DataTypes.INTEGER,
        allowNull: true
    },
    role: {
        type: DataTypes.STRING,
        allowNull: true
    },
    date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW
    },
    status: {
        type: DataTypes.ENUM('Present', 'Absent', 'Half-day', 'Late', 'Leave'),
        defaultValue: 'Present'
    },
    shift: {
        type: DataTypes.ENUM('Day', 'Night'),
        defaultValue: 'Day'
    },
    checkInTime: {
        type: DataTypes.STRING,
        allowNull: true
    },
    checkOutTime: {
        type: DataTypes.STRING,
        allowNull: true
    },
    checkIn: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.checkInTime;
        },
        set(value) {
            this.setDataValue('checkInTime', value);
        }
    },
    checkOut: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.checkOutTime;
        },
        set(value) {
            this.setDataValue('checkOutTime', value);
        }
    },
    totalHours: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    location: { // For Sales geo-location tracking
        type: DataTypes.JSON,
        allowNull: true
    }
});

const Attendance = makeBridgedModel('Attendance', AttendanceSequelize);
module.exports = Attendance;
