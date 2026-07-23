const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const PurchaseRequestSequelize = sequelize.define('PurchaseRequest', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    purchaseRequestId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    vendorId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    items: {
        type: DataTypes.JSON, // { materialId, quantity, name, sku }
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Accepted', 'Rejected', 'Supplied', 'Cancelled'),
        defaultValue: 'Pending'
    },
    priority: {
        type: DataTypes.ENUM('Low', 'Normal', 'High', 'Urgent'),
        defaultValue: 'Normal'
    },
    requestedById: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
});

const PurchaseRequest = makeBridgedModel('PurchaseRequest', PurchaseRequestSequelize);
module.exports = PurchaseRequest;
