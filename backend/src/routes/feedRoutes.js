const express = require('express');
const router = express.Router();
const { getPosts, createPost, deletePost, toggleLike, addComment } = require('../controllers/feedController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getPosts)
    .post(protect, createPost);

router.route('/:id')
    .delete(protect, deletePost);

router.post('/:id/like', protect, toggleLike);
router.post('/:id/comments', protect, addComment);

module.exports = router;
