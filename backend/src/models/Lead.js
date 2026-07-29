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
    companyName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Converted', 'Lost'),
        defaultValue: 'New'
    },
    source: {
        type: DataTypes.STRING,
        allowNull: true
    },
    dealValue: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
});

const Lead = makeBridgedModel('Lead', LeadSequelize);
module.exports = Lead;
