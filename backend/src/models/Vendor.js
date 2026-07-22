const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const VendorSequelize = sequelize.define('Vendor', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    contactPerson: {
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
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true
    },
    gstNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    website: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('Vendor Created', 'Approved Vendor', 'Receives Purchase Orders', 'Supplies Materials', 'In Transit', 'Delivered', 'Completed'),
        defaultValue: 'Vendor Created'
    },
    materialsSupplied: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('materialsSupplied');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(val) {
            this.setDataValue('materialsSupplied', JSON.stringify(val || []));
        }
    },
    rating: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0
    }
});

const Vendor = makeBridgedModel('Vendor', VendorSequelize);
module.exports = Vendor;
