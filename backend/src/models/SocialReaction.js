const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const SocialReactionSequelize = sequelize.define('SocialReaction', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    type: {
        type: DataTypes.ENUM('Like', 'Celebrate', 'Love', 'Support', 'Insightful'),
        allowNull: false
    },
    postId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    commentId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

const SocialReaction = makeBridgedModel('SocialReaction', SocialReactionSequelize);
module.exports = SocialReaction;
