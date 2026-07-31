const { GoogleGenerativeAI } = require('@google/generative-ai');
const AIChatSession = require('../models/AIChatSession');
const AIChatMessage = require('../models/AIChatMessage');
const sqlGenerator = require('./sqlGenerator');
const sqlValidator = require('./sqlValidator');
const businessInsights = require('./businessInsights');
const chartGenerator = require('./chartGenerator');
const reportGenerator = require('./reportGenerator');
const documentProcessor = require('./documentProcessor');
const workflowService = require('./workflowService');

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI ? genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }) : null;

let isAiConfigured = false;
let aiStatusMessage = "AI Service is not initialized.";

const initializeAIService = async () => {
    if (!apiKey || apiKey.includes('your_gemini_api_key_here')) {
        isAiConfigured = false;
        aiStatusMessage = "The AI Assistant is currently unavailable because the API key is not configured.";
        console.warn('\x1b[33m[AI Service] Disabled: API key is missing or set to placeholder.\x1b[0m');
        return false;
    }

    try {
        const testResult = await model.generateContent("Ping. Reply 'Pong' only.");
        if (testResult && testResult.response) {
            isAiConfigured = true;
            aiStatusMessage = "AI Service is online.";
            console.log('\x1b[32m[AI Service] Initialized successfully. Connection tested.\x1b[0m');
            return true;
        }
    } catch (error) {
        isAiConfigured = false;
        if (error.message?.includes('API key') || error.status === 400 || error.status === 401) {
            aiStatusMessage = "The AI Assistant is currently unavailable due to an invalid API key.";
            console.error('\x1b[31m[AI Service] Initialization failed: Invalid API key.\x1b[0m');
        } else {
            aiStatusMessage = "The AI Assistant is currently unavailable due to connectivity issues.";
            console.error('\x1b[31m[AI Service] Initialization failed:\x1b[0m', error.message);
        }
        return false;
    }
};

const handleGeminiError = (error) => {
    console.error('[AI Service Error Details]:', error.message || error);
    if (error.status === 429) {
        throw new Error('The AI Assistant is currently receiving too many requests. Please try again later.');
    }
    if (error.status === 401 || error.status === 403 || error.message?.toLowerCase().includes('api key')) {
        throw new Error('The AI Assistant is currently unavailable due to an API key issue.');
    }
    if (error.message?.includes('network') || error.message?.includes('fetch') || error.code === 'ENOTFOUND') {
        throw new Error('The AI Assistant is currently unavailable due to a network connection issue.');
    }
    throw new Error('An unexpected error occurred while communicating with the AI Assistant.');
};

const getSuggestedPrompts = (role) => {
    const prompts = {
        Admin: ['Business summary', 'Revenue report', 'Inventory status'],
        HR: ['Attendance summary', 'Payroll report', 'Employee statistics'],
        Manager: ['My team attendance', 'Pending approvals', 'Department KPI'],
        Employee: ['My attendance', 'My leave balance', 'My assigned tasks'],
        Sales: ['Monthly sales', 'Top customers', 'Revenue comparison'],
        Vendor: ['My purchase orders', 'Payment status', 'Pending invoices'],
        Customer: ['Track my order', 'Download invoice', 'Payment history']
    };
    return prompts[role] || ['How can I help you today?'];
};

const getFallbackResponse = (message) => {
    const msg = (message || '').toLowerCase();
    if (msg.includes('inventory') || msg.includes('material') || msg.includes('stock')) {
        return "SMTBMS tracks materials across all your warehouses in real-time. You can view stock levels, set reorder thresholds, and get automated alerts when inventory runs low.";
    }
    if (msg.includes('order') || msg.includes('purchase')) {
        return "Orders in SMTBMS follow a structured workflow: Order → Manager Approval → Employee Verification → Inventory Check → Purchase → Delivery → Invoice.";
    }
    if (msg.includes('revenue') || msg.includes('business summary') || msg.includes('report')) {
        return "To view detailed revenue reports and business summaries, please check the Reports & Analytics module. (Note: Advanced AI generation requires an API key).";
    }
    return "That's a great question! SMTBMS is a comprehensive system. Please note that the AI is currently in offline mode (API key not configured), but I can still answer basic questions!";
};

const aiActionHandler = require('./aiActionHandler');

const detectLocalIntent = (message) => {
    const msg = message.toLowerCase();
    if (msg.includes('attendance') || msg.includes('hr ')) return 'ATTENDANCE';
    if (msg.includes('payroll') || msg.includes('salary')) return 'PAYROLL';
    if (msg.includes('sale') || msg.includes('revenue') || msg.includes('order')) return 'SALES';
    if (msg.includes('inventory') || msg.includes('stock') || msg.includes('material')) return 'INVENTORY';
    return 'GENERAL';
};

const processChatMessage = async (user, message, sessionId) => {
    // 1. Get or Create Session
    let session;
    if (sessionId) {
        session = await AIChatSession.findOne({ where: { id: sessionId, userId: user.id } });
        if (!session) throw new Error('Session not found');
    } else {
        session = await AIChatSession.create({
            userId: user.id,
            title: message.substring(0, 30) + '...'
        });
    }

    // 2. Save User Message
    await AIChatMessage.create({
        sessionId: session.id,
        role: 'user',
        content: message
    });

    const anthropicOrchestrator = require('./anthropicOrchestrator');

    let aiResponse = { content: "I'm not sure how to help with that.", metadata: {} };

    try {
        // Fetch chat history for context
        const history = await AIChatMessage.findAll({
            where: { sessionId: session.id },
            order: [['createdAt', 'ASC']]
        });
        
        aiResponse = await anthropicOrchestrator.orchestrateChat(user, history, session.id);
    } catch (error) {
        console.error('Error in Anthropic Orchestrator:', error);
        aiResponse.content = "I encountered an error while processing your request with Claude.";
    }

    // 4. Save Assistant Message
    await AIChatMessage.create({
        sessionId: session.id,
        role: 'assistant',
        content: aiResponse.content,
        chartData: aiResponse.metadata ? JSON.stringify(aiResponse.metadata) : null
    });

    return {
        sessionId: session.id,
        content: aiResponse.content,
        metadata: aiResponse.metadata
    };
};

const processDocument = async (user, documentUrl, fileName, prompt) => {
    if (!isAiConfigured) throw new Error(aiStatusMessage);
    
    // Process via OCR Service
    const extractedText = await documentProcessor.extractText(documentUrl, fileName);

    // Ask Gemini
    const aiPrompt = `
        You are analyzing a document named "${fileName}" for a user with role ${user.role}.
        Document Text:
        ${extractedText}

        User Request: ${prompt}
    `;

    try {
        const result = await model.generateContent(aiPrompt);
        return {
            result: result.response.text()
        };
    } catch (error) {
        handleGeminiError(error);
    }
};

module.exports = {
    initializeAIService,
    getSuggestedPrompts,
    processChatMessage,
    processDocument,
    // Add pass-throughs if necessary for reportGenerator, etc.
    generateReport: reportGenerator.generateReport,
    executeAction: workflowService.executeAction
};
