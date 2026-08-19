const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const PostSequelize = sequelize.define('Post', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    authorId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: true // Allow null for articles with only title/body
    },
    imageUrl: {
        type: DataTypes.TEXT('long'),
        allowNull: true
    },
    media: {
        type: DataTypes.JSON, // Stores array of media objects { url, type }
        allowNull: true
    },
    visibility: {
        type: DataTypes.ENUM('Anyone', 'Connections only', 'Specific teams'),
        defaultValue: 'Anyone'
    },
    targetTeams: {
        type: DataTypes.JSON, // Stores array of team strings
        allowNull: true
    },
    type: {
        type: DataTypes.ENUM('Standard', 'Article', 'Story', 'Announcement', 'Broadcast'),
        defaultValue: 'Standard'
    },
    articleTitle: {
        type: DataTypes.STRING,
        allowNull: true
    },
    articleBody: {
        type: DataTypes.TEXT('long'),
        allowNull: true
    }
}, {
    timestamps: true
});

const Post = makeBridgedModel('Post', PostSequelize);
module.exports = Post;
