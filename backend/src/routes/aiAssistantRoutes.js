const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { 
    chat, 
    generateReport, 
    uploadDocument, 
    executeAction, 
    getHistory, 
    deleteHistory, 
    getPrompts 
} = require('../controllers/aiAssistantController');

const router = express.Router();

// All AI routes are protected
router.use(protect);

router.post('/chat', chat);
router.post('/report', generateReport);
router.post('/upload', uploadDocument);
router.post('/action', executeAction);
router.get('/history', getHistory);
router.delete('/history', deleteHistory);
router.get('/prompts', getPrompts);

module.exports = router;
