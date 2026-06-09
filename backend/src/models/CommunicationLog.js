const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const CommunicationLogSequelize = sequelize.define('CommunicationLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    customerId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('Call', 'Email', 'Meeting', 'Note'),
        allowNull: false
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    contactDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    createdById: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
});

const CommunicationLog = makeBridgedModel('CommunicationLog', CommunicationLogSequelize);
module.exports = CommunicationLog;
