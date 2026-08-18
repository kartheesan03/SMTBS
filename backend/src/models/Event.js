const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const EventSequelize = sequelize.define('Event', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    eventDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true
    },
    type: {
        type: DataTypes.ENUM('Meeting', 'Holiday', 'Birthday', 'Other'),
        defaultValue: 'Other'
    },
    organizerId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    timestamps: true
});

const Event = makeBridgedModel('Event', EventSequelize);
module.exports = Event;
