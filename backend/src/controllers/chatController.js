const { GoogleGenerativeAI } = require('@google/generative-ai');
const { aiToolsDeclarations, executeAITool } = require('../services/aiTools');
const SMTBMS_SYSTEM_PROMPT = `You are Aria, an AI support agent for the Smart Material Tracking & Business Management System (SMTBMS).
You act as an intelligent Query Router. Your goal is to map the user's intent to the database securely.

Models available (Exact case):
- Inventory/Materials: Material, MaterialMovement, StockRequest
- HRMS: Employee, Attendance, Leave, Salary, Recruitment, Training, Holiday
- CRM/Sales: Customer, Lead, Quotation, Order, SalesGoal
- Procurement: Vendor, PurchaseRequest
- Support/Tasks: Ticket, Task, Project
- Admin: User, Role, Notification, AuditLog, Backup
- OCR: OCRDocument

You have access to 'query_database' (Lookup/Search/Filter) and 'calculate_metrics' (Math/KPI) tools.

INTENT WORKFLOW:
1. LU (Lookup/Search/Filter): If user asks to "show", "find", or lists entities -> Use 'query_database'. The UI will render as TABLE.
2. CALC (Calculation/Totals): If user asks "how much", "how many", "total", "highest" -> Use 'calculate_metrics' (SUM, AVG, MIN, MAX, COUNT). The UI will render as KPI.
3. TREND (Comparison/Chart): If user asks "compare", "trend", "monthly" -> Query data or metrics for the periods and compare.
4. CROSS (Cross-Module): If user asks questions bridging two domains (e.g. "Which vendor supplies MS Plate?") -> Call tools sequentially. Fetch Material first, extract VendorId, then fetch Vendor.
5. WHY (Status/Reasoning): If user asks "why", "which needs attention" -> Fetch pending/delayed records and reason based on actual data.

RULES:
- NEVER guess data. Use ONLY returned real data.
- NEVER invent table names. Use the Exact Case names listed above.
- Synonyms: buyers=Customer, suppliers=Vendor, stock/items=Material, purchases=PurchaseRequest/Order(type=purchase), sales=Order(type=sales).
- Context: Remember previous queries if user says "their", "this", "those".
- Output: Do NOT output markdown tables. The system handles UI. Just give a friendly confirmation of the result.
- ALWAYS end with exactly 3 follow-up suggestions:
   Suggested Follow-ups:
   - Check [Model] report
   - Show low stock items
   - View recent orders`;

const deterministicCommands = {
    '/inventory': 'Material',
    '/materials': 'Material',
    '/orders': 'Order',
    '/sales': 'Order',
    '/customers': 'Customer',
    '/employees': 'Employee',
    '/ocr': 'OCRDocument',
    '/vendors': 'Vendor'
};

const { parseAndExecuteNLPQuery } = require('../services/nlpQueryEngine');
const chatWithGemini = async (req, res) => {
    try {
        const { message, history = [], context = null } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const command = message.trim().toLowerCase();
        if (command.startsWith('/')) {
            const modelName = deterministicCommands[command];
            if (modelName) {
                const toolResult = await executeAITool({ name: 'query_database', args: { modelName } });
                if (toolResult && toolResult.results) {
                    return res.json({
                        reply: `Here are the latest records for ${modelName}.`,
                        visualData: {
                            type: 'table',
                            modelName: modelName,
                            data: toolResult.results
                        },
                        metrics: [`Direct Command: ${command}`],
                        whyItMatters: "Direct routing bypassed AI for deterministic speed."
                    });
                }
            }
            return res.json({
                reply: `Command ${command} not recognized or no data found. Available commands: /inventory, /orders, /sales, /customers, /employees, /ocr, /vendors.`
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
            console.log("No Gemini API key found. Using local NLP Query Engine.");
            const nlpResult = await parseAndExecuteNLPQuery(message);
            if (!nlpResult.success) {
                return res.json({ reply: nlpResult.message });
            }
            
            return res.json({
                reply: nlpResult.answer || nlpResult.message,
                visualData: nlpResult,
                metrics: ["Source: Live Database"],
                whyItMatters: "Processed securely via local natural language to SQL engine."
            });
        }
        let dynamicPrompt = SMTBMS_SYSTEM_PROMPT;
        if (context && context.type && context.name) {
            dynamicPrompt += `\n\nCURRENT CONTEXT: The user is currently viewing the following ${context.type} entity: ${context.name} (ID: ${context.id}). Tailor your response and follow-ups to this context if relevant, without asking them to specify what they are looking at.`;
        }
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: dynamicPrompt,
            tools: [aiToolsDeclarations]
        });
        let validHistory = history.filter(msg => msg.role === 'user' || msg.role === 'assistant');
        
        // Gemini requires history to start with a user message and strictly alternate.
        let sanitizedHistory = [];
        let expectedRole = 'user';
        for (const msg of validHistory) {
            const mappedRole = msg.role === 'user' ? 'user' : 'model';
            if (mappedRole === expectedRole) {
                sanitizedHistory.push({
                    role: mappedRole,
                    parts: [{ text: msg.content || ' ' }]
                });
                expectedRole = expectedRole === 'user' ? 'model' : 'user';
            }
        }

        const chat = model.startChat({ history: sanitizedHistory });
        let result = await chat.sendMessage(message);
        let response = result.response;
        let fileMetadata = null;
        let visualData = null;
        let callCount = 0;
        const MAX_CALLS = 10;
        while (response.functionCalls && response.functionCalls().length > 0 && callCount < MAX_CALLS) {
            callCount++;
            const call = response.functionCalls()[0];
            const toolResult = await executeAITool(call);
            if (call.name === 'generate_report' && toolResult.file) {
                fileMetadata = toolResult.file;
            }
            if (call.name === 'query_database' && toolResult.results) {
                visualData = {
                    type: 'table',
                    modelName: toolResult.modelQuery,
                    data: toolResult.results
                };
            } else if (call.name === 'calculate_metrics' && toolResult.result !== undefined) {
                visualData = {
                    type: 'kpi',
                    modelName: toolResult.modelQuery,
                    operation: toolResult.operation,
                    field: toolResult.field || 'Records',
                    value: toolResult.result
                };
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
            replyText = replyText.replace(followUpRegex, '').trim();
        }
        return res.json({ 
            reply: replyText,
            file: fileMetadata,
            visualData: visualData,
            suggestions: suggestions.length > 0 ? suggestions : null
        });
    } catch (error) {
        console.error('Chat API error:', error.message);
        
        try {
            console.log("Falling back to local NLP Query Engine due to AI generation failure...");
            const nlpResult = await parseAndExecuteNLPQuery(req.body.message || "");
            if (!nlpResult.success) {
                return res.json({ reply: nlpResult.message });
            }
            
            return res.json({
                reply: nlpResult.answer || nlpResult.message,
                visualData: nlpResult,
                metrics: ["Source: Live Database"],
                whyItMatters: "Processed securely via local natural language to SQL engine."
            });
        } catch (fallbackError) {
            console.error('Fallback error:', fallbackError.message);
            return res.status(500).json({
                reply: "I encountered an error and couldn't process your request. Please try again shortly."
            });
        }
    }
};
module.exports = { chatWithGemini };
