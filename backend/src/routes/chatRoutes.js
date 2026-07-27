const express = require('express');
const router = express.Router();
const { chatWithGemini } = require('../controllers/chatController');

// POST /api/chat - Send a message to the AI assistant
router.post('/', chatWithGemini);

module.exports = router;
