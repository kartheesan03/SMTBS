const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const PostAcknowledgementSequelize = sequelize.define('PostAcknowledgement', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    postId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['postId', 'userId']
        }
    ]
});

const PostAcknowledgement = makeBridgedModel('PostAcknowledgement', PostAcknowledgementSequelize);
module.exports = PostAcknowledgement;
