const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const AuditLogSequelize = sequelize.define('AuditLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    userName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    action: {
        type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'LOGIN', 'EXPORT'),
        allowNull: false
    },
    module: {
        type: DataTypes.ENUM('Material', 'Order', 'Customer', 'Employee', 'Vendor', 'Attendance', 'Leave', 'Salary', 'Task', 'Ticket', 'System'),
        allowNull: false
    },
    targetId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    changes: {
        type: DataTypes.JSON,
        allowNull: true
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

const AuditLog = makeBridgedModel('AuditLog', AuditLogSequelize);
module.exports = AuditLog;
