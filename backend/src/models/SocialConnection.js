const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const SocialConnectionSequelize = sequelize.define('SocialConnection', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    requesterId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    recipientId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Accepted', 'Rejected'),
        defaultValue: 'Pending'
    }
});

const SocialConnection = makeBridgedModel('SocialConnection', SocialConnectionSequelize);
module.exports = SocialConnection;
