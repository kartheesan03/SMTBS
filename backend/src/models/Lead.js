const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const LeadSequelize = sequelize.define('Lead', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    source: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('New Lead', 'Initial Contact', 'Qualified Lead', 'Proposal Sent', 'Negotiation', 'Closing Deal', 'Won', 'Lost', 'Converted To Customer'),
        defaultValue: 'New Lead'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    estimatedValue: {
        type: DataTypes.DOUBLE,
        defaultValue: 0
    }
});

const Lead = makeBridgedModel('Lead', LeadSequelize);
module.exports = Lead;
