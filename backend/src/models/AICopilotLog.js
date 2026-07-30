const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const AICopilotLog = sequelize.define('AICopilotLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false
    },
    question: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    generatedSql: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    executionTimeMs: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    success: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'ai_copilot_logs',
    timestamps: true, // Automatically adds createdAt and updatedAt
});

module.exports = AICopilotLog;
