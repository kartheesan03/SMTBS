const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getToolDeclarations, executeTool } = require('../services/tools');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

const systemPrompt = `You are Aria, an AI assistant for an ERP system.
Your goal is to answer user queries by calling the appropriate tools.
If you need data to answer a question, use the tools provided.
Don't guess data.`;

const handleQuery = async (req, res) => {
    try {
        const { message, history = [] } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        const isOffline = (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey === 'dummy_key');

        let toolResponse = null;

        if (isOffline) {
            // Mock function calling logic for offline mode based on keywords
            const msgLower = message.toLowerCase();
            let matchedTool = null;
            let args = {};

            const unsupported = ['contractor', 'partner', 'truck', 'vehicle'];
            for(let word of unsupported) {
               if(msgLower.includes(word)) {
                   return res.json({ type: 'text', reply: `I don't have access to ${word} data yet.` });
               }
            }

            if (msgLower.includes('order') || msgLower.includes('sales') || msgLower.includes('revenue')) {
                matchedTool = 'get_orders';
                if (msgLower.includes('sales') || msgLower.includes('revenue')) args.type = 'sales';
                if (msgLower.includes('purchase')) args.type = 'purchase';
                if (msgLower.includes('revenue')) args.action = 'revenue';
            } else if (msgLower.includes('payroll')) {
                matchedTool = 'get_payroll';
                if (msgLower.includes('production')) args.department = 'Production';
            } else if (msgLower.includes('material') && msgLower.includes('consumption')) {
                matchedTool = 'get_material_consumption';
                if (msgLower.includes('steel')) args.materialName = 'Steel';
            } else if (msgLower.includes('inventory') || msgLower.includes('stock') || (msgLower.includes('material') && !msgLower.includes('consumption'))) {
                matchedTool = 'get_inventory';
                if (msgLower.includes('low')) args.filter = 'low_stock';
            } else if (msgLower.includes('employee')) {
                matchedTool = 'get_employees';
            } else if (msgLower.includes('customer')) {
                matchedTool = 'get_customers';
            } else if (msgLower.includes('vendor') || msgLower.includes('supplier')) {
                matchedTool = 'get_vendors';
            } else if (msgLower.includes('project')) {
                matchedTool = 'get_projects';
            }

            // If no explicit tool matched, check history for context
            if (!matchedTool && history && history.length > 0) {
                for (let i = history.length - 1; i >= 0; i--) {
                    if (history[i].role === 'user') {
                        const histLower = history[i].content.toLowerCase();
                        if (histLower.includes('order') || histLower.includes('sales')) {
                            matchedTool = 'get_orders';
                            if (histLower.includes('sales')) args.type = 'sales';
                            if (histLower.includes('purchase')) args.type = 'purchase';
                        } else if (histLower.includes('payroll')) {
                            matchedTool = 'get_payroll';
                        } else if (histLower.includes('material') && histLower.includes('consumption')) {
                            matchedTool = 'get_material_consumption';
                        } else if (histLower.includes('inventory') || histLower.includes('stock') || histLower.includes('material')) {
                            matchedTool = 'get_inventory';
                            if (histLower.includes('low')) args.filter = 'low_stock';
                        } else if (histLower.includes('employee')) {
                            matchedTool = 'get_employees';
                        } else if (histLower.includes('customer')) {
                            matchedTool = 'get_customers';
                        } else if (histLower.includes('vendor') || histLower.includes('supplier')) {
                            matchedTool = 'get_vendors';
                        } else if (histLower.includes('project')) {
                            matchedTool = 'get_projects';
                        }
                        if (matchedTool) break;
                    }
                }
            }

            // DB fallback: check if message contains employee or customer names
            if (!matchedTool) {
                const Employee = require('../models/Employee').sequelizeModel;
                const Customer = require('../models/Customer').sequelizeModel;
                
                const allEmps = await Employee.findAll({ attributes: ['firstName', 'lastName'] });
                for (let emp of allEmps) {
                    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase().trim();
                    if (fullName && msgLower.includes(fullName)) {
                        matchedTool = 'get_employees';
                        args.search = fullName;
                        break;
                    } else if (emp.firstName && msgLower.includes(emp.firstName.toLowerCase())) {
                        matchedTool = 'get_employees';
                        args.search = emp.firstName.toLowerCase();
                        break;
                    }
                }

                if (!matchedTool) {
                    const allCusts = await Customer.findAll({ attributes: ['name', 'company'] });
                    for (let cust of allCusts) {
                        const custName = (cust.name || '').toLowerCase().trim();
                        if (custName && msgLower.includes(custName)) {
                            matchedTool = 'get_customers';
                            args.search = custName;
                            break;
                        }
                    }
                }
            }

            if (!args.action && (msgLower.includes('total') || msgLower.includes('number') || msgLower.includes('count') || msgLower.includes('no'))) {
                args.action = 'count';
            }

            if (matchedTool) {
                // Execute mock tool
                const userContext = req.user || { role: 'admin' };
                toolResponse = await executeTool(matchedTool, args, userContext);
            }
        } else {
            // Real Gemini function calling
            const model = genAI.getGenerativeModel({ 
                model: 'gemini-2.5-flash', 
                systemInstruction: systemPrompt,
                tools: [{ functionDeclarations: getToolDeclarations() }]
            });

            let sanitizedHistory = [];
            let expectedRole = 'user';
            for (const msg of history) {
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
            const result = await chat.sendMessage(message);
            const call = result.response.functionCalls()?.[0];

            if (call) {
                const toolName = call.name;
                const toolArgs = call.args;
                const userContext = req.user || { role: 'admin' };
                toolResponse = await executeTool(toolName, toolArgs, userContext);
            } else {
                // No tool called
                return res.json({
                    type: 'text',
                    reply: result.response.text()
                });
            }
        }

        if (toolResponse) {
            return res.json(toolResponse);
        } else {
            return res.json({
                type: 'text',
                reply: "I couldn't determine which tool to use. Please ask for inventory, payroll, or material consumption."
            });
        }

    } catch (error) {
        console.error('Assistant API error:', error);
        return res.status(500).json({
            type: 'error',
            reply: `Aria encountered an error: ${error.message}`
        });
    }
};

module.exports = { handleQuery };
