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
    }
});

const Vendor = makeBridgedModel('Vendor', VendorSequelize);
module.exports = Vendor;
