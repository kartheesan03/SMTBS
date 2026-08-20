const SocialPost = require('../models/SocialPost');
const SocialComment = require('../models/SocialComment');
const SocialReaction = require('../models/SocialReaction');
const SocialConnection = require('../models/SocialConnection');
const SocialMessage = require('../models/SocialMessage');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');

exports.getFeed = async (req, res) => {
    try {
        const posts = await SocialPost.sequelizeModel.findAll({
            include: [
                { model: User.sequelizeModel, as: 'author', attributes: ['id', 'username'] },
                { model: SocialReaction.sequelizeModel, as: 'reactions' }
            ],
            order: [['createdAt', 'DESC']],
            limit: 50
        });
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching feed' });
    }
};

exports.createPost = async (req, res) => {
    try {
        const { content, type, mediaUrl } = req.body;
        const post = await SocialPost.sequelizeModel.create({
            content,
            type: type || 'Standard',
            authorId: req.user.id,
            mediaUrl
        });
        res.status(201).json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating post' });
    }
};

exports.reactToPost = async (req, res) => {
    try {
        const { type } = req.body; // e.g. 'Like', 'Celebrate'
        const postId = req.params.id;
        const userId = req.user.id;

        const existingReaction = await SocialReaction.sequelizeModel.findOne({ where: { postId, userId } });
        if (existingReaction) {
            if (existingReaction.type === type) {
                await existingReaction.destroy();
                // decrement post reaction count manually if we want to store it in the table
                await SocialPost.sequelizeModel.decrement('likesCount', { by: 1, where: { id: postId } });
                return res.json({ message: 'Reaction removed' });
            } else {
                existingReaction.type = type;
                await existingReaction.save();
                return res.json(existingReaction);
            }
        }

        const reaction = await SocialReaction.sequelizeModel.create({ type, postId, userId });
        await SocialPost.sequelizeModel.increment('likesCount', { by: 1, where: { id: postId } });
        res.status(201).json(reaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error reacting to post' });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const postId = req.params.id;
        const comment = await SocialComment.sequelizeModel.create({
            content,
            postId,
            authorId: req.user.id
        });
        await SocialPost.sequelizeModel.increment('commentsCount', { by: 1, where: { id: postId } });
        res.status(201).json(comment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding comment' });
    }
};

exports.getComments = async (req, res) => {
    try {
        const comments = await SocialComment.sequelizeModel.findAll({
            where: { postId: req.params.id },
            include: [{ model: User.sequelizeModel, as: 'author', attributes: ['id', 'username'] }],
            order: [['createdAt', 'ASC']]
        });
        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching comments' });
    }
};

// Network
exports.getNetwork = async (req, res) => {
    try {
        const userId = req.user.id;
        const connections = await SocialConnection.sequelizeModel.findAll({
            where: {
                [require('sequelize').Op.or]: [
                    { requesterId: userId },
                    { recipientId: userId }
                ]
            }
        });
        res.json(connections);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching network' });
    }
};

exports.handleConnectionRequest = async (req, res) => {
    try {
        const { recipientId, action } = req.body; // action: 'send', 'accept', 'reject'
        const requesterId = req.user.id;
        if (action === 'send') {
            const conn = await SocialConnection.sequelizeModel.create({ requesterId, recipientId, status: 'Pending' });
            return res.status(201).json(conn);
        } else if (action === 'accept') {
            const conn = await SocialConnection.sequelizeModel.findOne({ where: { requesterId: recipientId, recipientId: requesterId } });
            if (conn) {
                conn.status = 'Accepted';
                await conn.save();
                return res.json(conn);
            }
        } else if (action === 'reject') {
            await SocialConnection.sequelizeModel.destroy({ where: { requesterId: recipientId, recipientId: requesterId } });
            return res.json({ message: 'Rejected' });
        }
        res.status(400).json({ message: 'Invalid action' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error handling connection' });
    }
};

exports.getSuggestions = async (req, res) => {
    // Return random employees for "People You May Know"
    try {
        const users = await User.sequelizeModel.findAll({ limit: 5 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching suggestions' });
    }
};

// Profile
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.sequelizeModel.findByPk(req.params.userId, {
            attributes: ['id', 'username', 'email', 'role']
        });
        const employee = await Employee.sequelizeModel.findOne({ where: { userIdField: req.params.userId } });
        res.json({ user, employee });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile' });
    }
};

exports.updateProfile = async (req, res) => {
    res.json({ message: 'Update profile placeholder' });
};

// Messages
exports.getConversations = async (req, res) => {
    try {
        // Simple logic to get unique contacts user has messaged
        res.json([]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching conversations' });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const userId1 = req.user.id;
        const userId2 = req.params.userId;
        const { Op } = require('sequelize');
        const messages = await SocialMessage.sequelizeModel.findAll({
            where: {
                [Op.or]: [
                    { senderId: userId1, receiverId: userId2 },
                    { senderId: userId2, receiverId: userId1 }
                ]
            },
            order: [['createdAt', 'ASC']]
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages' });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const message = await SocialMessage.sequelizeModel.create({
            senderId: req.user.id,
            receiverId,
            content
        });
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: 'Error sending message' });
    }
};

exports.deleteMessage = async (req, res) => {
    try {
        const messageId = req.params.id;
        const userId = req.user.id;
        
        const message = await SocialMessage.sequelizeModel.findByPk(messageId);
        if (!message) return res.status(404).json({ message: 'Message not found' });
        
        if (message.senderId !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this message' });
        }
        
        await message.destroy();
        res.json({ message: 'Message deleted' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ message: 'Error deleting message' });
    }
};
