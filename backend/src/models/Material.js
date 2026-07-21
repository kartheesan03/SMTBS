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
    // ── Additional Details ────────────────────────────────────────────────────
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
    // ── Unified location fields (single source of truth) ──────────────────────
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
        // Derived display string: warehouse + ' / ' + shelf, or just warehouse.
        // Stored so all modules read the same value without re-deriving.
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    gpsStatus: {
        // Real-time GPS/movement status for delivery lifecycle.
        type: DataTypes.ENUM('At Warehouse', 'In Transit', 'Delivered', 'Signal Lost'),
        defaultValue: 'At Warehouse'
    },
    locationUpdatedAt: {
        // Timestamp of last location or gpsStatus change — used for "Last Updated" display.
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    },
    // ── Delivery Lifecycle Fields ─────────────────────────────────────────────
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

const Material = makeBridgedModel('Material', MaterialSequelize);
module.exports = Material;
