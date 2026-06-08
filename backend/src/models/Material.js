const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const MaterialSequelize = sequelize.define('Material', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    sku: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    reservedQuantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lowStockThreshold: {
        type: DataTypes.INTEGER,
        defaultValue: 10
    },
    unit: {
        type: DataTypes.STRING,
        defaultValue: 'pcs'
    },
    price: {
        type: DataTypes.DOUBLE,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('In Stock', 'Out of Stock', 'Low Stock'),
        defaultValue: 'In Stock'
    },
    vendorId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
});

const Material = makeBridgedModel('Material', MaterialSequelize);
module.exports = Material;
