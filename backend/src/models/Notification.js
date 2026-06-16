const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const NotificationSequelize = sequelize.define('Notification', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    module: {
        type: DataTypes.STRING,
        allowNull: false
    },
    referenceId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    role: {
        type: DataTypes.STRING,
        allowNull: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('warning', 'info', 'success', 'error'),
        defaultValue: 'info'
    },
    status: {
        type: DataTypes.ENUM('unread', 'read'),
        defaultValue: 'unread'
    }
});

const Notification = makeBridgedModel('Notification', NotificationSequelize);
module.exports = Notification;
