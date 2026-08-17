const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const SocialCommentSequelize = sequelize.define('SocialComment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    postId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    authorId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    likesCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
});

const SocialComment = makeBridgedModel('SocialComment', SocialCommentSequelize);
module.exports = SocialComment;
