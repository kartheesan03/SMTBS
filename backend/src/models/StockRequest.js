const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const StockRequestSequelize = sequelize.define('StockRequest', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    materialId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    employeeId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    managerId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    currentStock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    requiredQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    managerMessage: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Manager Approved', 'Rejected', 'More Info Requested', 'Processing', 'Dispatched', 'Delivered', 'Cancelled', 'Completed'),
        defaultValue: 'Pending'
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    history: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: '[]' // Will store JSON stringified array of { status, timestamp, user }
    }
}, {
    timestamps: true
});

const StockRequest = makeBridgedModel('StockRequest', StockRequestSequelize);
module.exports = StockRequest;
