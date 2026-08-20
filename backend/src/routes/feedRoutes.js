const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getPosts, getSavedPosts, createPost, deletePost, toggleLike, toggleRepost, addComment, deleteComment, toggleSave, getNews, getEvents, toggleFollow, getFollowing, getSuggestedConnections, getStories, toggleAcknowledge, getTrendingTags, getPostById } = require('../controllers/feedController');
const { protect } = require('../middleware/authMiddleware');

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'smtbms_feed',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov']
  },
});
const upload = multer({ storage });

router.route('/')
    .get(protect, getPosts)
    .post(protect, upload.single('media'), createPost);

router.get('/saved', protect, getSavedPosts);
router.get('/stories', protect, getStories);
router.get('/news', protect, getNews);
router.get('/events', protect, getEvents);
router.get('/suggestions', protect, getSuggestedConnections);
router.get('/following', protect, getFollowing);
router.get('/trending', protect, getTrendingTags);

router.route('/:id')
    .get(getPostById)
    .delete(protect, deletePost);

router.post('/:id/like', protect, toggleLike);
router.post('/:id/repost', protect, toggleRepost);
router.post('/:id/comments', protect, addComment);
router.delete('/comments/:commentId', protect, deleteComment);
router.post('/:id/save', protect, toggleSave);
router.post('/:id/acknowledge', protect, toggleAcknowledge);
router.post('/follow/:userId', protect, toggleFollow);

module.exports = router;
