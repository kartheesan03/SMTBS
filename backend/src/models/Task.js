const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const TaskSequelize = sequelize.define('Task', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    assignedTo: {
        type: DataTypes.JSON,
        allowNull: true
    },
    assignedById: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    completions: {
        type: DataTypes.JSON,
        allowNull: true
    },
    priority: {
        type: DataTypes.ENUM('Low', 'Medium', 'High'),
        defaultValue: 'Medium'
    },
    dueDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    isBroadcast: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

const Task = makeBridgedModel('Task', TaskSequelize);
module.exports = Task;
