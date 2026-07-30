const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const AIChatSession = sequelize.define('AIChatSession', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'New Chat'
    }
}, {
    timestamps: true,
    tableName: 'AIChatSessions'
});

module.exports = AIChatSession;
