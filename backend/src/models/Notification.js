const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const NotificationSequelize = sequelize.define('Notification', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
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
    category: {
        type: DataTypes.ENUM('stock', 'hr', 'order', 'system', 'general'),
        defaultValue: 'general'
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    link: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

const Notification = makeBridgedModel('Notification', NotificationSequelize);
module.exports = Notification;
