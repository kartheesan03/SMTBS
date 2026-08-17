const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const SocialPostSequelize = sequelize.define('SocialPost', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('Standard', 'Achievement', 'Announcement', 'Recognition', 'Project Update', 'Event', 'Knowledge Sharing'),
        defaultValue: 'Standard'
    },
    authorId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    mediaUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    likesCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    commentsCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    isPinned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

const SocialPost = makeBridgedModel('SocialPost', SocialPostSequelize);
module.exports = SocialPost;
