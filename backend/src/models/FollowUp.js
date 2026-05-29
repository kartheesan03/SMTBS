const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const FollowUpSequelize = sequelize.define('FollowUp', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('Call', 'Email', 'Meeting'),
        defaultValue: 'Call'
    },
    time: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Completed', 'Overdue'),
        defaultValue: 'Pending'
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    createdById: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
});

const FollowUp = makeBridgedModel('FollowUp', FollowUpSequelize);
module.exports = FollowUp;
