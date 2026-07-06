const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const ProjectSequelize = sequelize.define('Project', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Planning', 'In Progress', 'Completed', 'Delayed'),
        defaultValue: 'Planning'
    },
    progress: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    deadline: {
        type: DataTypes.DATE,
        allowNull: true
    },
    manager: {
        type: DataTypes.STRING,
        allowNull: true
    },
    priority: {
        type: DataTypes.ENUM('Low', 'Medium', 'High'),
        defaultValue: 'Medium'
    },
    color: {
        type: DataTypes.STRING,
        defaultValue: '#3b82f6'
    }
}, {
    tableName: 'projects',
    timestamps: true
});

const Project = makeBridgedModel(ProjectSequelize);

module.exports = Project;
