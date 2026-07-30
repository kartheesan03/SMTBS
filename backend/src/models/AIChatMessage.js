const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const AIChatSession = require('./AIChatSession');

const AIChatMessage = sequelize.define('AIChatMessage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sessionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: AIChatSession,
            key: 'id'
        }
    },
    role: {
        type: DataTypes.ENUM('user', 'assistant', 'system'),
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    actionTaken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    sqlQuery: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    chartData: {
        type: DataTypes.TEXT,
        allowNull: true // Store JSON stringified chart data if applicable
    }
}, {
    timestamps: true,
    tableName: 'AIChatMessages'
});

AIChatSession.hasMany(AIChatMessage, { foreignKey: 'sessionId', as: 'messages' });
AIChatMessage.belongsTo(AIChatSession, { foreignKey: 'sessionId', as: 'session' });

module.exports = AIChatMessage;
