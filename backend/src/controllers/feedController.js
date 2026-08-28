const Post = require('../models/Post');
const PostComment = require('../models/PostComment');
const PostLike = require('../models/PostLike');
const PostRepost = require('../models/PostRepost');
const SavedPost = require('../models/SavedPost');
const News = require('../models/News');
const Event = require('../models/Event');
const Follow = require('../models/Follow');
const User = require('../models/User');
const PostAcknowledgement = require('../models/PostAcknowledgement');
const StoryView = require('../models/StoryView');
const sequelize = require('../config/sequelize');

const getPostById = async (req, res) => {
    try {
        const post = await Post.sequelizeModel.findOne({
            where: { id: req.params.id },
            include: [
                {
                    model: User.sequelizeModel,
                    as: 'author',
                    attributes: ['id', 'name', 'picture', 'role']
                },
                {
                    model: PostLike.sequelizeModel,
                    as: 'likes',
                    attributes: ['userId']
                }
            ]
        });

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post);
    } catch (error) {
        console.error('Error in getPostById:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = (page - 1) * limit;
        
        const { Op } = require('sequelize');
        const Employee = require('../models/Employee');
        const employee = await Employee.sequelizeModel.findOne({ where: { userIdField: req.user.id } });
        const userDept = employee ? employee.department : '';

        const whereClause = {
            type: { [Op.ne]: 'Story' },
            [Op.or]: [
                { visibility: 'Anyone' },
                { visibility: 'Connections only' }
            ]
        };

        if (userDept) {
            whereClause[Op.or].push({
                visibility: 'Specific teams',
                targetTeams: { [Op.like]: `%${userDept}%` }
            });
        }

        const { count, rows } = await Post.sequelizeModel.findAndCountAll({
            where: whereClause,
            offset,
            limit,
            order: [
                [sequelize.literal(`CASE WHEN type = 'Announcement' THEN 1 ELSE 2 END`), 'ASC'],
                ['createdAt', 'DESC']
            ],
            include: [
                {
                    model: User.sequelizeModel,
                    as: 'author',
                    attributes: ['id', 'name', 'picture', 'role']
                },
                {
                    model: PostComment.sequelizeModel,
                    as: 'comments',
                    include: [
                        {
                            model: User.sequelizeModel,
                            as: 'author',
                            attributes: ['id', 'name', 'picture', 'role']
                        }
                    ]
                },
                {
                    model: PostLike.sequelizeModel,
                    as: 'likes',
                    include: [
                        {
                            model: User.sequelizeModel,
                            as: 'user',
                            attributes: ['id', 'name']
                        }
                    ]
                },
                {
                    model: PostRepost.sequelizeModel,
                    as: 'reposts',
                    attributes: ['userId']
                },
                {
                    model: SavedPost.sequelizeModel,
                    as: 'savedBy',
                    attributes: ['userId']
                },
                {
                    model: PostAcknowledgement.sequelizeModel,
                    as: 'acknowledgements',
                    attributes: ['userId']
                }
            ],
            distinct: true
        });

        res.json({
            posts: rows,
            page,
            pages: Math.ceil(count / limit),
            total: count
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const uploadMedia = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        let url;
        if (req.file.path && req.file.path.startsWith('http')) {
            url = req.file.path;
        } else {
            url = '/uploads/' + req.file.filename;
        }
        res.status(200).json({ url, type: req.file.mimetype });
    } catch (error) {
        console.error('Error uploading media:', error);
        res.status(500).json({ message: 'Upload failed' });
    }
};

const createPost = async (req, res) => {
    try {
        const { broadcast } = require('../services/notificationService');
        let { text, imageUrl, media, visibility, type, articleTitle, articleBody, targetTeams } = req.body;
        
        if (req.file) {
            // Cloudinary provides a full URL in req.file.path
            if (req.file.path && req.file.path.startsWith('http')) {
                imageUrl = req.file.path;
            } else {
                // Local disk storage fallback
                imageUrl = '/uploads/' + req.file.filename;
            }
        }
        
        if (typeof targetTeams === 'string') {
            try { targetTeams = JSON.parse(targetTeams); } catch (e) { targetTeams = []; }
        }
        
        if (typeof media === 'string') {
            try { media = JSON.parse(media); } catch (e) { media = null; }
        }

        const post = await Post.sequelizeModel.create({
            text,
            imageUrl,
            media,
            visibility: visibility || 'Anyone',
            targetTeams,
            type,
            articleTitle,
            articleBody,
            authorId: req.user.id
        });
        
        // Fetch it again to get author details
        const createdPost = await Post.sequelizeModel.findByPk(post.id, {
            include: [
                {
                    model: User.sequelizeModel,
                    as: 'author',
                    attributes: ['id', 'name', 'picture', 'role']
                },
                {
                    model: PostComment.sequelizeModel,
                    as: 'comments'
                },
                {
                    model: PostLike.sequelizeModel,
                    as: 'likes'
                }
            ]
        });
        res.status(201).json(createdPost);

        // Send notifications for Announcements and Broadcasts
        if (type === 'Announcement' || type === 'Broadcast') {
            let title = type === 'Announcement' ? 'New Company Announcement' : 'New Broadcast Message';
            if (articleTitle) title = articleTitle;
            
            let messageStr = text ? (text.length > 100 ? text.substring(0, 100) + '...' : text) : 'A new update was posted on the company feed.';
            
            await broadcast({
                module: 'System',
                referenceId: post.id,
                title: title,
                message: messageStr,
                type: 'info',
                targetAll: true
            });
        }

    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deletePost = async (req, res) => {
    try {
        const post = await Post.sequelizeModel.findByPk(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        if (String(post.authorId) !== String(req.user.id) && req.user.role !== 'Admin' && req.user.role !== 'Super Admin') {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        // Manually delete associations to prevent foreign key constraint errors
        await PostComment.sequelizeModel.destroy({ where: { postId: post.id } });
        await PostLike.sequelizeModel.destroy({ where: { postId: post.id } });
        await PostRepost.sequelizeModel.destroy({ where: { postId: post.id } });
        await SavedPost.sequelizeModel.destroy({ where: { postId: post.id } });
        
        if (PostAcknowledgement && PostAcknowledgement.sequelizeModel) {
            await PostAcknowledgement.sequelizeModel.destroy({ where: { postId: post.id } });
        }

        await post.destroy();
        res.json({ message: 'Post removed' });
    } catch (error) {
        console.error('Error deleting post:', error);
        require('fs').writeFileSync('deletePostError.log', String(error.stack || error));
        res.status(500).json({ message: 'Server error', error: String(error) });
    }
};

const toggleLike = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;

        const existingLike = await PostLike.sequelizeModel.findOne({
            where: { postId, userId }
        });

        if (existingLike) {
            await existingLike.destroy();
            res.json({ message: 'Post unliked', liked: false });
        } else {
            await PostLike.sequelizeModel.create({ postId, userId });
            res.json({ message: 'Post liked', liked: true });
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;

        const comment = await PostComment.sequelizeModel.create({
            text,
            postId,
            authorId: req.user.id
        });

        const createdComment = await PostComment.sequelizeModel.findByPk(comment.id, {
            include: [
                {
                    model: User.sequelizeModel,
                    as: 'author',
                    attributes: ['id', 'name', 'picture', 'role']
                }
            ]
        });

        res.status(201).json(createdComment);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteComment = async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const comment = await PostComment.sequelizeModel.findByPk(commentId);
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        
        const post = await Post.sequelizeModel.findByPk(comment.postId);
        const isPostAuthor = post && String(post.authorId) === String(req.user.id);
        
        if (String(comment.authorId) !== String(req.user.id) && !isPostAuthor && req.user.role !== 'Admin' && req.user.role !== 'Super Admin') {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        await comment.destroy();
        res.json({ message: 'Comment deleted' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const toggleSave = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;

        const existingSave = await SavedPost.sequelizeModel.findOne({
            where: { postId, userId }
        });

        if (existingSave) {
            await existingSave.destroy();
            res.json({ message: 'Post unsaved', saved: false });
        } else {
            await SavedPost.sequelizeModel.create({ postId, userId });
            res.json({ message: 'Post saved', saved: true });
        }
    } catch (error) {
        console.error('Error toggling save:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

const getNews = async (req, res) => {
    try {
        const news = await News.sequelizeModel.findAll({
            limit: 5,
            order: [['publishedAt', 'DESC']],
            include: [{ model: User.sequelizeModel, as: 'author', attributes: ['id', 'name'] }]
        });
        res.json(news);
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getEvents = async (req, res) => {
    try {
        const events = await Event.sequelizeModel.findAll({
            limit: 5,
            order: [['eventDate', 'ASC']],
            where: {
                eventDate: {
                    [require('sequelize').Op.gte]: new Date()
                }
            }
        });
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const toggleFollow = async (req, res) => {
    try {
        const followingId = req.params.userId;
        const followerId = req.user.id;

        if (followingId == followerId) return res.status(400).json({ message: 'Cannot follow yourself' });

        const existingFollow = await Follow.sequelizeModel.findOne({
            where: { followerId, followingId }
        });

        if (existingFollow) {
            await existingFollow.destroy();
            res.json({ message: 'Unfollowed', following: false });
        } else {
            await Follow.sequelizeModel.create({ followerId, followingId });
            res.json({ message: 'Followed', following: true });
        }
    } catch (error) {
        console.error('Error toggling follow:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getSuggestedConnections = async (req, res) => {
    try {
        // Find users not currently followed
        const followedIds = (await Follow.sequelizeModel.findAll({
            where: { followerId: req.user.id },
            attributes: ['followingId']
        })).map(f => f.followingId);

        followedIds.push(req.user.id);

        const Op = require('sequelize').Op;
        const users = await User.sequelizeModel.findAll({
            where: {
                id: {
                    [Op.notIn]: followedIds
                },
                role: {
                    [Op.ne]: 'Customer'
                }
            },
            limit: 5,
            attributes: ['id', 'name', 'picture', 'role']
        });
        res.json(users);
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
const getFollowing = async (req, res) => {
    try {
        const follows = await Follow.sequelizeModel.findAll({
            where: { followerId: req.user.id },
            include: [
                {
                    model: User.sequelizeModel,
                    as: 'following',
                    attributes: ['id', 'name', 'picture', 'role', 'createdAt']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        const result = follows.map(f => ({
            id: f.following?.id,
            name: f.following?.name,
            picture: f.following?.picture,
            role: f.following?.role,
            department: f.following?.department,
            followedAt: f.createdAt,
        })).filter(u => u.id);

        res.json(result);
    } catch (error) {
        console.error('Error fetching following list:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getSavedPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = (page - 1) * limit;

        const { count, rows: savedPosts } = await SavedPost.sequelizeModel.findAndCountAll({
            where: { userId: req.user.id },
            offset,
            limit,
            order: [['createdAt', 'DESC']]
        });

        const postIds = savedPosts.map(sp => sp.postId);

        if (postIds.length === 0) {
            return res.json({ posts: [], page, pages: 0, total: 0 });
        }

        const posts = await Post.sequelizeModel.findAll({
            where: { id: postIds },
            include: [
                {
                    model: User.sequelizeModel,
                    as: 'author',
                    attributes: ['id', 'name', 'picture', 'role']
                },
                {
                    model: PostComment.sequelizeModel,
                    as: 'comments',
                    include: [
                        {
                            model: User.sequelizeModel,
                            as: 'author',
                            attributes: ['id', 'name', 'picture', 'role']
                        }
                    ]
                },
                {
                    model: PostLike.sequelizeModel,
                    as: 'likes',
                    include: [
                        {
                            model: User.sequelizeModel,
                            as: 'user',
                            attributes: ['id', 'name']
                        }
                    ]
                },
                {
                    model: SavedPost.sequelizeModel,
                    as: 'savedBy',
                    attributes: ['userId']
                }
            ]
        });

        // Ensure posts are returned in the order they were saved
        const postsMap = {};
        posts.forEach(p => postsMap[p.id] = p);
        const orderedPosts = postIds.map(id => postsMap[id]).filter(Boolean);

        res.json({
            posts: orderedPosts,
            page,
            pages: Math.ceil(count / limit),
            total: count
        });
    } catch (error) {
        console.error('Error fetching saved posts:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getStories = async (req, res) => {
    try {
        const { Op } = require('sequelize');
        // Fetch stories from the last 24 hours
        const twentyFourHoursAgo = new Date(new Date() - 24 * 60 * 60 * 1000);
        
        const stories = await Post.sequelizeModel.findAll({
            where: {
                type: 'Story',
                createdAt: {
                    [Op.gte]: twentyFourHoursAgo
                }
            },
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: User.sequelizeModel,
                    as: 'author',
                    attributes: ['id', 'name', 'picture', 'role']
                },
                {
                    model: StoryView.sequelizeModel,
                    as: 'views',
                    attributes: ['userId']
                }
            ]
        });

        res.json(stories);
    } catch (error) {
        console.error('Error fetching stories:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const toggleAcknowledge = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;

        const post = await Post.sequelizeModel.findByPk(postId);
        if (!post || post.type !== 'Announcement') {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        const existingAck = await PostAcknowledgement.sequelizeModel.findOne({
            where: { postId, userId }
        });

        if (existingAck) {
            // Already acknowledged, maybe they want to un-acknowledge? Sure.
            await existingAck.destroy();
            res.json({ message: 'Acknowledgement removed' });
        } else {
            await PostAcknowledgement.sequelizeModel.create({
                postId,
                userId
            });
            res.json({ message: 'Acknowledged successfully' });
        }
    } catch (error) {
        console.error('Error toggling acknowledgement:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const toggleRepost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;

        const post = await Post.sequelizeModel.findByPk(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const existing = await PostRepost.sequelizeModel.findOne({
            where: { postId, userId }
        });

        if (existing) {
            await existing.destroy();
            res.json({ message: 'Repost removed', reposted: false });
        } else {
            await PostRepost.sequelizeModel.create({ postId, userId });
            res.json({ message: 'Reposted', reposted: true });
        }
    } catch (error) {
        console.error('Error toggling repost:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getTrendingTags = async (req, res) => {
    try {
        const posts = await Post.sequelizeModel.findAll({
            limit: 200,
            attributes: ['text'],
            order: [['createdAt', 'DESC']]
        });
        
        const tagCounts = {};
        posts.forEach(p => {
            if (!p.text) return;
            const matches = p.text.match(/#\w+/g);
            if (matches) {
                matches.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });
        
        const trending = Object.keys(tagCounts)
            .map(tag => ({ tag, count: tagCounts[tag], posts: `${tagCounts[tag]} post${tagCounts[tag] > 1 ? 's' : ''}` }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        res.json(trending);
    } catch (error) {
        console.error('Error fetching trending tags:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Company profile stats — real member count from DB + env-driven metadata
const getCompanyStats = async (req, res) => {
    try {
        const memberCount = await User.sequelizeModel.count({ where: { active: true } });
        res.json({
            name:     process.env.COMPANY_NAME     || 'SMTBMS Solutions',
            tagline:  process.env.COMPANY_TAGLINE  || 'Official Company Updates & Network',
            industry: process.env.COMPANY_INDUSTRY || 'ERP Systems',
            location: process.env.COMPANY_LOCATION || 'India',
            members:  memberCount
        });
    } catch (error) {
        console.error('Error fetching company stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getPosts,
    getSavedPosts,
    createPost,
    deletePost,
    toggleLike,
    toggleRepost,
    addComment,
    deleteComment,
    toggleSave,
    getNews,
    getEvents,
    toggleFollow,
    getFollowing,
    getSuggestedConnections,
    getStories,
    toggleAcknowledge,
    getTrendingTags,
    getPostById,
    getCompanyStats,
    uploadMedia
};
