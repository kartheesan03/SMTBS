const { GoogleGenerativeAI } = require('@google/generative-ai');

const SMTBMS_SYSTEM_PROMPT = `You are SMTBMS Assistant, an AI support agent for the Smart Material Tracking & Business Management System (SMTBMS). 

You help users understand:
- SMTBMS Features: Inventory Management, Warehouse Management, Purchase Orders, Vendor Management, Order Workflow, AI Analytics, Notifications, Reports & Dashboards
- How the system works: Materials are tracked across multiple warehouses. Orders go through: Order → Manager Approval → Employee Verification → Inventory Check → Purchase → Delivery → Invoice
- Roles: Admin, Manager, Employee
- The platform tracks 20,000+ materials across 200+ warehouses with 99.9% uptime
- Pricing, getting started, and onboarding questions

Guidelines:
- Be helpful, concise, and professional
- Keep responses under 150 words unless more detail is specifically requested
- If asked about something outside SMTBMS scope, politely redirect to SMTBMS topics
- For technical support issues, suggest contacting the admin or visiting the help section
- Always be encouraging and solution-oriented
- Do not make up specific data (prices, exact user counts, etc.)

Start each session warmly and offer to help.`;

const chatWithGemini = async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const apiKey = process.env.GEMINI_API_KEY;

        // Fallback for when no API key is configured
        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
            return res.json({
                reply: getFallbackResponse(message)
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: SMTBMS_SYSTEM_PROMPT
        });

        // Build conversation history for multi-turn context
        const chatHistory = history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        const chat = model.startChat({ history: chatHistory });
        const result = await chat.sendMessage(message);
        const reply = result.response.text();

        return res.json({ reply });

    } catch (error) {
        console.error('Chat API error:', error.message);
        
        // Return friendly fallback on error
        return res.json({
            reply: "I'm having a moment of difficulty connecting. Please try again shortly, or visit our Help section for immediate support!"
        });
    }
};

// Smart rule-based fallback when no API key is available
const getFallbackResponse = (message) => {
    const msg = message.toLowerCase();
    
    if (msg.includes('inventory') || msg.includes('material') || msg.includes('stock')) {
        return "SMTBMS tracks materials across all your warehouses in real-time. You can view stock levels, set reorder thresholds, and get automated alerts when inventory runs low. Head to the Inventory section after logging in!";
    }
    if (msg.includes('order') || msg.includes('purchase')) {
        return "Orders in SMTBMS follow a structured workflow: Order → Manager Approval → Employee Verification → Inventory Check → Purchase → Delivery → Invoice. Every step is tracked and auditable.";
    }
    if (msg.includes('vendor') || msg.includes('supplier')) {
        return "SMTBMS maintains a complete vendor directory with performance metrics, contact details, and material catalogs. You can compare vendors and track delivery history all in one place.";
    }
    if (msg.includes('warehouse')) {
        return "SMTBMS manages 200+ warehouses with real-time location tracking, bin management, and movement history. Each warehouse can have its own staff, materials, and workflows.";
    }
    if (msg.includes('login') || msg.includes('sign up') || msg.includes('register') || msg.includes('account')) {
        return "You can create an account by clicking 'Sign Up' in the top navigation. For existing users, click 'Log In'. If you've forgotten your password, use the reset option on the login page.";
    }
    if (msg.includes('price') || msg.includes('cost') || msg.includes('plan') || msg.includes('free')) {
        return "For pricing information, please contact our sales team or reach out through the Help section. We offer flexible plans for businesses of all sizes.";
    }
    if (msg.includes('ai') || msg.includes('analytics') || msg.includes('forecast')) {
        return "SMTBMS includes AI-powered features like demand forecasting, smart search, automated reorder suggestions, inventory insights, and anomaly detection to keep your operations intelligent and proactive.";
    }
    if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey') || msg.includes('help')) {
        return "Hello! I'm the SMTBMS Assistant. I can help you with inventory management, warehouse operations, order workflows, vendor management, and more. What would you like to know?";
    }
    
    return "That's a great question! SMTBMS is a comprehensive inventory and warehouse management system. For specific questions, I recommend exploring our Features section or contacting our support team for personalized assistance.";
};

module.exports = { chatWithGemini };
