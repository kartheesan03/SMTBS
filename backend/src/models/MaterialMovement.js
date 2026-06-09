const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const MaterialMovementSequelize = sequelize.define('MaterialMovement', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    materialId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('In', 'Out', 'Adjustment'),
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    previousQuantity: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    newQuantity: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: true
    },
    referenceOrderId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    performedById: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
});

const MaterialMovement = makeBridgedModel('MaterialMovement', MaterialMovementSequelize);
module.exports = MaterialMovement;
