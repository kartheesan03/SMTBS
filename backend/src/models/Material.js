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
    },
    latitude: {
        type: DataTypes.DOUBLE,
        allowNull: true
    },
    longitude: {
        type: DataTypes.DOUBLE,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    condition: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'New'
    },
    source: {
        type: DataTypes.STRING,
        allowNull: true
    },
    certifications: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    used_in: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    specs: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    },
    images: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    warehouse: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    rack: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    shelf: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    gpsStatus: {
        type: DataTypes.ENUM('At Warehouse', 'In Transit', 'Delivered', 'Signal Lost'),
        defaultValue: 'At Warehouse'
    },
    locationUpdatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    },
    deliveryDestination: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    deliveryEta: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    },
    deliveryDispatchedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    },
    deliveryCompletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    }
});
const socket = require('../socket');

MaterialSequelize.addHook('afterCreate', (instance, options) => {
    try { socket.getIO().emit('erp_update', { module: 'materials', action: 'create', data: instance.toJSON() }); } catch (e) {}
});
MaterialSequelize.addHook('afterUpdate', (instance, options) => {
    try { socket.getIO().emit('erp_update', { module: 'materials', action: 'update', data: instance.toJSON() }); } catch (e) {}
});
MaterialSequelize.addHook('afterDestroy', (instance, options) => {
    try { socket.getIO().emit('erp_update', { module: 'materials', action: 'destroy', data: instance.toJSON() }); } catch (e) {}
});

const Material = makeBridgedModel('Material', MaterialSequelize);
module.exports = Material;
