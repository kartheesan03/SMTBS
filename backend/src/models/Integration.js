const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const IntegrationSequelize = sequelize.define('Integration', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    provider: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    isConnected: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    config: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    timestamps: true,
    freezeTableName: true
});

const Integration = makeBridgedModel('Integration', IntegrationSequelize);
module.exports = Integration;
