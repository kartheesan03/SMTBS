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

const processChatMessage = async (user, message, sessionId) => {
    if (!isAiConfigured) throw new Error(aiStatusMessage);

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

    // 3. Process the intent using Gemini
    const intentPrompt = `
        You are the AI Assistant for SMTBMS. The user role is ${user.role}.
        Analyze the following user message and output a JSON object describing the intent.
        Possible intents: "SQL_QUERY" (needs database analytics), "WORKFLOW_ACTION" (e.g., create PO, approve leave), "GENERAL_CHAT".
        Message: "${message}"
        Output JSON format: { "intent": "INTENT_TYPE", "actionType": "if workflow action", "details": "any extracted entities" }
    `;

    let intentResult;
    let intentText = '';
    try {
        intentResult = await model.generateContent(intentPrompt);
        intentText = intentResult.response.text();
    } catch (error) {
        handleGeminiError(error);
    }
    let intentData = { intent: 'GENERAL_CHAT' };
    
    try {
        const jsonMatch = intentText.match(/```json\n([\s\S]*?)\n```/) || intentText.match(/({[\s\S]*})/);
        if (jsonMatch) intentData = JSON.parse(jsonMatch[1]);
    } catch (e) {
        console.warn('Failed to parse intent JSON, defaulting to GENERAL_CHAT');
    }

    let assistantResponse = '';
    let chartData = null;
    let sqlQuery = null;

    try {
        if (intentData.intent === 'SQL_QUERY') {
            const sqlResult = await sqlGenerator.generateAndExecuteSQL(user, message);
            sqlQuery = sqlResult.sql;
            assistantResponse = await businessInsights.generateInsights(message, sqlResult.data, user.role);
            chartData = await chartGenerator.generateChartConfig(sqlResult.data);
        } else if (intentData.intent === 'WORKFLOW_ACTION') {
            assistantResponse = await workflowService.handleActionIntent(user, intentData);
        } else {
            const chatPrompt = `You are the SMTBMS AI Assistant helping a ${user.role}. Answer the following message concisely: ${message}`;
            const chatResult = await model.generateContent(chatPrompt);
            assistantResponse = chatResult.response.text();
        }
    } catch (error) {
        if (error.name === 'SequelizeDatabaseError') {
             throw new Error('An error occurred while running the analytics query. Please rephrase your question.');
        }
        handleGeminiError(error);
    }

    // 4. Save Assistant Message
    const assistantMsg = await AIChatMessage.create({
        sessionId: session.id,
        role: 'assistant',
        content: assistantResponse,
        sqlQuery: sqlQuery,
        chartData: chartData ? JSON.stringify(chartData) : null
    });

    return {
        sessionId: session.id,
        message: assistantResponse,
        chartData: chartData
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
