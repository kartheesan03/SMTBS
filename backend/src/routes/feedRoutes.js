const express = require('express');
const router = express.Router();
const { getPosts, createPost, deletePost, toggleLike, addComment, toggleSave, getNews, getEvents, toggleFollow, getSuggestedConnections } = require('../controllers/feedController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getPosts)
    .post(protect, createPost);

router.get('/news', protect, getNews);
router.get('/events', protect, getEvents);
router.get('/suggestions', protect, getSuggestedConnections);

router.route('/:id')
    .delete(protect, deletePost);

router.post('/:id/like', protect, toggleLike);
router.post('/:id/comments', protect, addComment);
router.post('/:id/save', protect, toggleSave);
router.post('/follow/:userId', protect, toggleFollow);

module.exports = router;
