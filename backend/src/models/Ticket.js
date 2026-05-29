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
    customerId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    leadId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    customerModel: {
        type: DataTypes.ENUM('Customer', 'Lead'),
        defaultValue: 'Customer'
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    priority: {
        type: DataTypes.ENUM('Low', 'Medium', 'High'),
        defaultValue: 'Medium'
    },
    status: {
        type: DataTypes.ENUM('Open', 'In Progress', 'Resolved', 'Closed'),
        defaultValue: 'Open'
    },
    category: {
        type: DataTypes.ENUM('General', 'Technical', 'Billing', 'Other'),
        defaultValue: 'General'
    },
    assignedToId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    hooks: {
        beforeValidate: (ticket) => {
            // Polymorphic resolution before save
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
