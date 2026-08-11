const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');
const TicketSequelize = sequelize.define('Ticket', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ticketNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    customerId: { // kept for legacy
        type: DataTypes.INTEGER,
        allowNull: true
    },
    leadId: { // kept for legacy
        type: DataTypes.INTEGER,
        allowNull: true
    },
    customerModel: { // kept for legacy
        type: DataTypes.ENUM('Customer', 'Lead'),
        defaultValue: 'Customer'
    },
    submittedById: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    attachment: {
        type: DataTypes.STRING,
        allowNull: true
    },
    priority: {
        type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
        defaultValue: 'Medium'
    },
    status: {
        type: DataTypes.ENUM('Open', 'In Progress', 'Waiting for User', 'Resolved', 'Closed'),
        defaultValue: 'Open'
    },
    category: {
        type: DataTypes.STRING,
        defaultValue: 'General Query'
    },
    assignedToId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    hooks: {
        beforeValidate: (ticket) => {
            if (ticket.customer) {
                if (ticket.customerModel === 'Customer') {
                    ticket.customerId = ticket.customer;
                    ticket.leadId = null;
                } else if (ticket.customerModel === 'Lead') {
                    ticket.leadId = ticket.customer;
                    ticket.customerId = null;
                }
            }
        }
    }
});
const Ticket = makeBridgedModel('Ticket', TicketSequelize);
module.exports = Ticket;
