const Post = require('../models/Post');
const PostComment = require('../models/PostComment');
const PostLike = require('../models/PostLike');
const User = require('../models/User');

const getPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Post.sequelizeModel.findAndCountAll({
            offset,
            limit,
            order: [['createdAt', 'DESC']],
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

const createPost = async (req, res) => {
    try {
        const { text, imageUrl } = req.body;
        const post = await Post.sequelizeModel.create({
            text,
            imageUrl,
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
        
        if (post.authorId !== req.user.id && req.user.role !== 'Admin' && req.user.role !== 'Super Admin') {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await post.destroy();
        res.json({ message: 'Post removed' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Server error' });
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

module.exports = {
    getPosts,
    createPost,
    deletePost,
    toggleLike,
    addComment
};
