const AIChatSession = require('../models/AIChatSession');
const AIChatMessage = require('../models/AIChatMessage');
const aiService = require('../services/aiService');

// @route   POST /api/ai/chat
// @desc    Send a message to the AI Assistant
// @access  Protected
const chat = async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        const user = req.user;

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        // Process message through aiService
        const response = await aiService.processChatMessage(user, message, sessionId);

        res.status(200).json(response);
    } catch (error) {
        console.error('[AI Assistant Chat Error]:', error);
        res.status(500).json({ message: error.message || 'Failed to process AI chat' });
    }
};

// @route   POST /api/ai/report
// @desc    Generate a report based on a natural language query
// @access  Protected
const generateReport = async (req, res) => {
    try {
        const { query, format } = req.body;
        const user = req.user;

        if (!query) return res.status(400).json({ message: 'Query is required' });

        const report = await aiService.generateReport(user, query, format);
        res.status(200).json(report);
    } catch (error) {
        console.error('[AI Report Error]:', error);
        res.status(500).json({ message: error.message || 'Failed to generate report' });
    }
};

// @route   POST /api/ai/upload
// @desc    Upload a document for OCR and AI summarization/extraction
// @access  Protected
const uploadDocument = async (req, res) => {
    try {
        const { prompt, documentUrl, fileName } = req.body; // Assume base64 or URL is passed
        const user = req.user;

        if (!documentUrl) return res.status(400).json({ message: 'Document URL or base64 is required' });

        const response = await aiService.processDocument(user, documentUrl, fileName, prompt);
        res.status(200).json(response);
    } catch (error) {
        console.error('[AI Upload Error]:', error);
        res.status(500).json({ message: error.message || 'Failed to process document' });
    }
};

// @route   POST /api/ai/action
// @desc    Execute a business action via AI
// @access  Protected
const executeAction = async (req, res) => {
    try {
        const { actionData, sessionId } = req.body;
        const user = req.user;

        const response = await aiService.executeAction(user, actionData, sessionId);
        res.status(200).json(response);
    } catch (error) {
        console.error('[AI Action Error]:', error);
        res.status(500).json({ message: error.message || 'Failed to execute action' });
    }
};

// @route   GET /api/ai/history
// @desc    Get chat sessions history
// @access  Protected
const getHistory = async (req, res) => {
    try {
        const sessions = await AIChatSession.findAll({
            where: { userId: req.user.id },
            order: [['updatedAt', 'DESC']],
            include: [{
                model: AIChatMessage,
                as: 'messages',
                limit: 1, // Only get the latest message for preview if needed
                order: [['createdAt', 'DESC']]
            }]
        });

        res.status(200).json(sessions);
    } catch (error) {
        console.error('[AI History Error]:', error);
        res.status(500).json({ message: 'Failed to retrieve chat history' });
    }
};

// @route   DELETE /api/ai/history
// @desc    Delete a chat session
// @access  Protected
const deleteHistory = async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) return res.status(400).json({ message: 'Session ID is required' });

        await AIChatSession.destroy({
            where: { id: sessionId, userId: req.user.id }
        });

        res.status(200).json({ message: 'Session deleted successfully' });
    } catch (error) {
        console.error('[AI Delete History Error]:', error);
        res.status(500).json({ message: 'Failed to delete chat session' });
    }
};

// @route   GET /api/ai/prompts
// @desc    Get suggested prompts based on role
// @access  Protected
const getPrompts = async (req, res) => {
    try {
        const userRole = req.user.role;
        const prompts = aiService.getSuggestedPrompts(userRole);
        res.status(200).json(prompts);
    } catch (error) {
        console.error('[AI Prompts Error]:', error);
        res.status(500).json({ message: 'Failed to get prompts' });
    }
};

module.exports = {
    chat,
    generateReport,
    uploadDocument,
    executeAction,
    getHistory,
    deleteHistory,
    getPrompts
};
