const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const FollowSequelize = sequelize.define('Follow', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    followerId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    followingId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['followerId', 'followingId']
        }
    ]
});

const Follow = makeBridgedModel('Follow', FollowSequelize);
module.exports = Follow;
