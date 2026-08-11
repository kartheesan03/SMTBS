const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const TicketMessageSequelize = sequelize.define('TicketMessage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ticketId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    senderId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    attachment: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isInternal: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

const TicketMessage = makeBridgedModel('TicketMessage', TicketMessageSequelize);
module.exports = TicketMessage;
