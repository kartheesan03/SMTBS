const { GoogleGenerativeAI } = require('@google/generative-ai');
const { aiToolsDeclarations, executeAITool } = require('../services/aiTools');

const SMTBMS_SYSTEM_PROMPT = `You are Aria, an AI support agent for the Smart Material Tracking & Business Management System (SMTBMS). 
You help users manage and query data across the entire database.

You have access to a universal query tool. Use it to query ANY of the following database models (always use exact case):
- Inventory/Materials: Material, MaterialMovement, StockRequest
- HRMS: Employee, Attendance, Leave, Salary, Recruitment, Training, Holiday
- CRM/Sales: Customer, Lead, Quotation, Order, SalesGoal
- Procurement: Vendor, PurchaseRequest
- Support/Tasks: Ticket, Task, Project
- Admin: User, Role, Notification, AuditLog, Backup

Guidelines:
- ALWAYS use the 'query_database' tool to fetch real data before answering questions about records, numbers, or statuses. Never make up data.
- If the user asks for a report, use the 'generate_report' tool with the correct modelName.
- If the request is ambiguous (e.g., "how many units are left" but no item specified), ask a clarifying question.
- If the request targets a domain we don't have a model for, explain your limitations clearly.
- Render results in clean markdown tables when returning lists of data. Bold key numbers.
- At the end of your response, you MUST provide exactly 3 relevant follow-up suggestions in a markdown list format starting with "Suggested Follow-ups:", so the frontend can extract them.
- Example: 
  Suggested Follow-ups:
  - Check [Model] report
  - Show low stock items
  - View recent orders`;

const chatWithGemini = async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
            // OFFLINE MODE MOCK (Fallback logic)
            let toolResult;
            let replyText = "I'm currently running in offline mode without an API key, so my natural language understanding is limited. I will try my best to match your keyword to a table!";
            let fileMetadata = null;
            
            const msgLower = message.toLowerCase();
            
            // Very rudimentary intent matching for offline testing
            let modelNameMatch = null;
            if (msgLower.includes('inventory') || msgLower.includes('stock') || msgLower.includes('material')) modelNameMatch = 'Material';
            else if (msgLower.includes('vendor')) modelNameMatch = 'Vendor';
            else if (msgLower.includes('order')) modelNameMatch = 'Order';
            else if (msgLower.includes('employee') || msgLower.includes('staff')) modelNameMatch = 'Employee';
            else if (msgLower.includes('attendance')) modelNameMatch = 'Attendance';
            else if (msgLower.includes('leave')) modelNameMatch = 'Leave';
            else if (msgLower.includes('customer')) modelNameMatch = 'Customer';
            else if (msgLower.includes('task')) modelNameMatch = 'Task';
            else if (msgLower.includes('user')) modelNameMatch = 'User';

            if (msgLower.includes('report') && modelNameMatch) {
                toolResult = await executeAITool({ name: 'generate_report', args: { modelName: modelNameMatch } });
                if (toolResult && toolResult.file) {
                    fileMetadata = toolResult.file;
                    replyText = `I've generated the ${modelNameMatch} report for you in offline mode. You can download it below.`;
                }
            } else if (modelNameMatch) {
                toolResult = await executeAITool({ name: 'query_database', args: { modelName: modelNameMatch } });
                if (toolResult && toolResult.results && toolResult.results.length > 0) {
                    // Generate a generic markdown table for the first 5 columns of the results
                    const headers = Object.keys(toolResult.results[0]).slice(0, 5);
                    let table = `| ${headers.join(' | ')} |\n|${headers.map(() => '---').join('|')}|\n`;
                    toolResult.results.forEach(row => {
                        table += `| ${headers.map(h => String(row[h]).substring(0, 20)).join(' | ')} |\n`;
                    });
                    replyText = `Here is the data for **${modelNameMatch}** (Offline Mode):\n\n${table}`;
                } else {
                    replyText = `I queried the **${modelNameMatch}** table, but no records were found.`;
                }
            }

            return res.json({
                reply: replyText,
                file: fileMetadata
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: SMTBMS_SYSTEM_PROMPT,
            tools: [aiToolsDeclarations]
        });

        // Build conversation history for multi-turn context
        const chatHistory = history
            .filter(msg => msg.role === 'user' || msg.role === 'assistant')
            .map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }));

        const chat = model.startChat({ history: chatHistory });
        let result = await chat.sendMessage(message);
        let response = result.response;
        
        let fileMetadata = null;

        // Function calling loop
        while (response.functionCalls && response.functionCalls().length > 0) {
            const call = response.functionCalls()[0];
            const toolResult = await executeAITool(call);
            
            // If the tool was generate_report, extract the file info
            if (call.name === 'generate_report' && toolResult.file) {
                fileMetadata = toolResult.file;
            }

            result = await chat.sendMessage([{
                functionResponse: {
                    name: call.name,
                    response: toolResult
                }
            }]);
            response = result.response;
        }

        let replyText = response.text();
        
        // Extract follow-up suggestions generated by Gemini
        const suggestions = [];
        const followUpRegex = /Suggested Follow-ups:([\s\S]*)/i;
        const match = replyText.match(followUpRegex);
        if (match) {
            const lines = match[1].split('\n').filter(line => line.trim().startsWith('-'));
            lines.forEach(line => {
                const text = line.replace(/^- /, '').trim();
                if (text) {
                    suggestions.push({ title: text.substring(0, 20) + '...', desc: text });
                }
            });
            // Remove the suggestions list from the final chat display text
            replyText = replyText.replace(followUpRegex, '').trim();
        }

        return res.json({ 
            reply: replyText,
            file: fileMetadata,
            suggestions: suggestions.length > 0 ? suggestions : null
        });

    } catch (error) {
        console.error('Chat API error:', error.message);
        return res.status(500).json({
            reply: "I'm having a moment of difficulty connecting. Please try again shortly."
        });
    }
};

module.exports = { chatWithGemini };
