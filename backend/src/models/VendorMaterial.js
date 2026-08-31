const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const VendorMaterialSequelize = sequelize.define('VendorMaterial', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    vendorId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    materialId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    supplierPrice: {
        type: DataTypes.DOUBLE,
        allowNull: true
    },
    leadTime: {
        type: DataTypes.INTEGER, // in days
        allowNull: true
    },
    minOrderQty: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1
    },
    isPreferred: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    status: {
        type: DataTypes.ENUM('Active', 'Inactive'),
        defaultValue: 'Active'
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['vendorId', 'materialId']
        }
    ]
});

const VendorMaterial = makeBridgedModel('VendorMaterial', VendorMaterialSequelize);
module.exports = VendorMaterial;
