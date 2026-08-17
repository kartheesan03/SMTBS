const express = require('express');
const router = express.Router();
const socialController = require('../controllers/socialController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All social routes require authentication

// Posts
router.get('/feed', socialController.getFeed);
router.post('/posts', socialController.createPost);
router.post('/posts/:id/react', socialController.reactToPost);
router.post('/posts/:id/comments', socialController.addComment);
router.get('/posts/:id/comments', socialController.getComments);

// Network
router.get('/network', socialController.getNetwork);
router.post('/network/connect', socialController.handleConnectionRequest);
router.get('/network/suggestions', socialController.getSuggestions);

// Profile
router.get('/profile/:userId', socialController.getUserProfile);
router.put('/profile', socialController.updateProfile); // if we use a separate table or update Employee

// Messages
router.get('/messages', socialController.getConversations);
router.get('/messages/:userId', socialController.getMessages);
router.post('/messages', socialController.sendMessage);

module.exports = router;
