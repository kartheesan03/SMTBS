const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const SalesGoalSequelize = sequelize.define('SalesGoal', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    assignedTo: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    period: {
        type: DataTypes.STRING,
        defaultValue: 'Monthly'
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    targetAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    targetOrders: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    createdBy: {
        type: DataTypes.INTEGER
    }
});

const SalesGoal = makeBridgedModel('SalesGoal', SalesGoalSequelize);
module.exports = SalesGoal;
