const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

const getModel = (modelName) => {
    try {
        const modelPath = path.join(__dirname, '..', 'models', `${modelName}.js`);
        if (fs.existsSync(modelPath)) {
            return require(modelPath);
        }
        return null;
    } catch (e) {
        console.error(`Failed to load model ${modelName}:`, e);
        return null;
    }
};

/**
 * Maps a natural language message to a safe Database Query response.
 */
const parseAndExecuteNLPQuery = async (message, context = null) => {
    const msg = message.toLowerCase().trim();
    
    // 1. Determine the Entity (Model)
    let modelName = context?.modelName || null;
    let baseWhere = {};
    let include = [];
    let order = [['createdAt', 'DESC']]; // default order
    
    // Intent flags
    let intent = 'FIND_ALL'; 
    let targetName = null;
    let targetId = null;

    // Apply context if the message contains pronouns or context words
    if (context && context.modelName && (msg.includes('they') || msg.includes('them') || msg.includes('these') || msg.includes('those') || msg.includes('ones') || msg.includes('are there'))) {
        modelName = context.modelName;
        intent = context.intent || 'FIND_ALL';
    }

    // Check intents
    if (msg.match(/how many|no of|number of|count/)) intent = 'COUNT';
    else if (msg.includes('total') && (msg.includes('revenue') || msg.includes('value') || msg.includes('amount') || msg.includes('sales'))) intent = 'SUM';
    else if (msg.includes('average') || msg.includes('avg')) intent = 'AVG';
    else if (msg.match(/find (invoice|po-|purchase order) (.+)/)) {
        const match = msg.match(/find (invoice|po-|purchase order) (.+)/);
        intent = 'FIND_SPECIFIC';
        targetId = match[2].trim().replace(/\.$/, ''); 
    }
    else if (msg.includes('find') || msg.includes('search for')) {
        intent = 'FIND_SPECIFIC';
        const match = msg.match(/(?:find|search for) (?:employee |customer )?(.+)/);
        if (match) targetName = match[1].trim().replace(/\.$/, '');
    }
    else if (msg.includes('highest') || msg.includes('top') || msg.includes('most')) {
        intent = 'TOP';
    }

    // Identify entity and special relationships
    if (msg.includes('customer')) {
        modelName = 'Customer';
        if (msg.includes('active')) baseWhere.status = 'Active';
    } else if (msg.includes('employee') || msg.includes('manager') || msg.includes('hr') || msg.includes('staff')) {
        modelName = 'Employee';
        if (msg.includes('hr')) baseWhere.department = { [Op.like]: '%HR%' };
        if (msg.includes('manager')) baseWhere.role = { [Op.like]: '%Manager%' };
        if (msg.includes('active')) baseWhere.status = 'Active';
        if (msg.includes('recently joined') || msg.includes('joined recently')) order = [['joinDate', 'DESC']];
    } else if (msg.includes('purchase order') || msg.includes('po-')) {
        modelName = 'Order';
        baseWhere.orderType = 'purchase';
        if (msg.includes('vendor name') || msg.includes('vendors')) {
            const Vendor = getModel('Vendor');
            if (Vendor) include.push({ model: Vendor.sequelizeModel || Vendor, as: 'vendor' });
        }
        if (msg.includes('pending')) baseWhere.status = 'Pending';
        if (msg.includes('latest')) order = [['createdAt', 'DESC']];
    } else if (msg.includes('order') || msg.includes('sale')) {
        modelName = 'Order';
        if (msg.includes('sale')) baseWhere.orderType = 'sales';
        if (msg.includes('pending')) baseWhere.status = 'Pending';
        if (intent === 'TOP' && msg.includes('customer')) {
             intent = 'TOP_CUSTOMER_REVENUE';
        }
    } else if (msg.includes('material') || msg.includes('inventory') || msg.includes('stock')) {
        modelName = 'Material';
        if (msg.includes('low stock') || msg.includes('low-stock')) baseWhere.status = 'Low Stock'; 
        if (msg.includes('available')) baseWhere.status = 'In Stock'; 
        if (msg.includes('total') && msg.includes('value')) intent = 'SUM_INVENTORY';
    } else if (msg.includes('document') || msg.includes('invoice') || msg.includes('ocr')) {
        modelName = 'OCRDocument';
        if (msg.includes('pending')) baseWhere.processingStatus = 'Pending';
        if (msg.includes('approved')) baseWhere.processingStatus = 'Approved';
        if (msg.includes('latest')) order = [['createdAt', 'DESC']];
    } else if (msg.includes('vendor')) {
        modelName = 'Vendor';
        if (msg.includes('active')) baseWhere.status = 'Active';
    }

    // Date parsing
    const dateField = (modelName === 'Employee' && msg.includes('join')) ? 'joinDate' : 'createdAt';
    if (msg.includes('today')) {
        const start = new Date(); start.setHours(0,0,0,0);
        baseWhere[dateField] = { [Op.gte]: start };
    } else if (msg.includes('yesterday')) {
        const start = new Date(); start.setDate(start.getDate() - 1); start.setHours(0,0,0,0);
        const end = new Date(); end.setDate(end.getDate() - 1); end.setHours(23,59,59,999);
        baseWhere[dateField] = { [Op.gte]: start, [Op.lte]: end };
    } else if (msg.includes('this week')) {
        const start = new Date(); start.setDate(start.getDate() - start.getDay()); start.setHours(0,0,0,0);
        baseWhere[dateField] = { [Op.gte]: start };
    } else if (msg.includes('this month')) {
        const start = new Date(); start.setDate(1); start.setHours(0,0,0,0);
        baseWhere[dateField] = { [Op.gte]: start };
    } else if (msg.includes('last month')) {
        const start = new Date(); start.setMonth(start.getMonth() - 1); start.setDate(1); start.setHours(0,0,0,0);
        const end = new Date(); end.setDate(0); end.setHours(23,59,59,999);
        baseWhere[dateField] = { [Op.gte]: start, [Op.lte]: end };
    } else if (msg.includes('this year')) {
        const start = new Date(); start.setMonth(0, 1); start.setHours(0,0,0,0);
        baseWhere[dateField] = { [Op.gte]: start };
    }

    if (!modelName) {
        return {
            success: false,
            error: 'UNSUPPORTED_QUESTION',
            message: "I can currently answer questions about customers, employees, vendors, orders, inventory, sales and invoices."
        };
    }

    const ModelClass = getModel(modelName);
    if (!ModelClass) {
        return {
            success: false,
            error: 'DATABASE_ERROR',
            message: "I couldn't retrieve that information from the database right now. Please try again."
        };
    }

    const Model = ModelClass.sequelizeModel || ModelClass;

    try {
        let resultData = null;
        let replyMessage = "";
        let visualType = "table";
        let displayTitle = modelName;
        let metricContext = [];

        // Execute Intent
        if (intent === 'COUNT') {
            const count = await Model.count({ where: baseWhere });
            replyMessage = `I found ${count} ${modelName.toLowerCase()}s in the database.`;
            visualType = "metric";
            resultData = count;
            displayTitle = `${modelName}s`;
            metricContext = [`Total ${modelName.toLowerCase()}s`];
        } 
        else if (intent === 'SUM' || intent === 'AVG') {
            let field = 'totalAmount';
            if (modelName === 'OCRDocument') field = 'totalAmount'; 
            
            const result = intent === 'SUM' 
                ? await Model.sum(field, { where: baseWhere })
                : await Model.sum(field, { where: baseWhere }) / await Model.count({ where: baseWhere });
            
            const safeResult = result || 0;
            replyMessage = `The ${intent === 'SUM' ? 'total' : 'average'} is ₹${safeResult.toLocaleString()}.`;
            visualType = "metric";
            resultData = safeResult;
            displayTitle = `${intent === 'SUM' ? 'Total' : 'Average'} ${modelName === 'Order' && baseWhere.orderType==='sales' ? 'Sales' : modelName}`;
        }
        else if (intent === 'SUM_INVENTORY') {
            const items = await Model.findAll({ where: baseWhere, raw: true });
            const total = items.reduce((acc, item) => acc + ((item.quantity || 0) * (item.price || 0)), 0);
            replyMessage = `The total inventory value is ₹${total.toLocaleString()}.`;
            visualType = "metric";
            resultData = total;
            displayTitle = `Inventory Value`;
        }
        else if (intent === 'FIND_SPECIFIC') {
            if (targetId) {
                let specificWhere = { ...baseWhere };
                if (modelName === 'Order') specificWhere.orderNumber = { [Op.like]: `%${targetId}%` };
                else if (modelName === 'OCRDocument') specificWhere.documentNumber = { [Op.like]: `%${targetId}%` }; 
                
                const records = await Model.findAll({ where: specificWhere, include, limit: 10, order, raw: true, nest: true });
                if (records.length === 0) {
                    return { success: true, type: 'text', message: `No ${modelName.toLowerCase()} matching "${targetId}" was found.` };
                }
                resultData = records;
                replyMessage = `Here are the details for ${targetId}:`;
            } else if (targetName) {
                const records = await Model.findAll({
                    where: { ...baseWhere, name: { [Op.like]: `%${targetName}%` } },
                    include, limit: 10, order, raw: true, nest: true
                });
                if (records.length === 0) {
                    return { success: true, type: 'text', message: `No ${modelName.toLowerCase()} named ${targetName} was found.` };
                }
                resultData = records;
                replyMessage = `Here are the details for ${targetName}:`;
            }
        }
        else if (intent === 'TOP_CUSTOMER_REVENUE') {
            const CustomerModel = getModel('Customer');
            if (CustomerModel) {
                const Customer = CustomerModel.sequelizeModel || CustomerModel;
                const records = await Model.findAll({
                    attributes: [
                        'customerId',
                        [Model.sequelize.fn('SUM', Model.sequelize.col('totalAmount')), 'totalRevenue']
                    ],
                    where: baseWhere,
                    group: ['customerId'],
                    order: [[Model.sequelize.fn('SUM', Model.sequelize.col('totalAmount')), 'DESC']],
                    include: [{ model: Customer, as: 'Customer', attributes: ['name'] }],
                    limit: 5,
                    raw: true,
                    nest: true
                });
                
                // Format for chart
                resultData = records.map(r => ({
                    customer: r.Customer?.name || 'Unknown',
                    revenue: parseFloat(r.totalRevenue)
                }));
                visualType = "chart";
                replyMessage = "Here are the top customers by revenue:";
                displayTitle = "Top Customers";
            } else {
                return { success: false, error: 'DATABASE_ERROR', message: "Unable to find customer relations." };
            }
        }
        else {
            // FIND_ALL 
            let limit = 50;
            const numMatch = msg.match(/(?:latest|last|top|first|show me|get)\s+(\d+)/);
            if (numMatch) {
                limit = parseInt(numMatch[1], 10);
            } else if (msg.includes('first 10') || msg.includes('top 10')) {
                limit = 10;
            }
            const records = await Model.findAll({ where: baseWhere, include, limit, order, raw: true, nest: true });
            if (records.length === 0) {
                return {
                    success: true,
                    type: 'count',
                    title: displayTitle,
                    source: 'Live Database',
                    value: 0,
                    formattedValue: '0',
                    message: `No ${modelName.toLowerCase()} records found matching your query.`,
                    answer: `No ${modelName.toLowerCase()} records found matching your query.`
                };
            }
            resultData = records;
            replyMessage = `Here are the ${modelName.toLowerCase()}s from the database.`;
        }
        
        let finalResponse = {
            success: true,
            type: visualType,
            title: displayTitle,
            source: 'Live Database',
            message: replyMessage,
            answer: replyMessage,
            context: { modelName, intent }
        };

        if (visualType === 'metric') {
            finalResponse.type = 'count';
            finalResponse.value = resultData;
            finalResponse.formattedValue = intent === 'COUNT' ? resultData.toString() : `₹${resultData.toLocaleString()}`;
            finalResponse.metrics = metricContext;
        } else if (visualType === 'chart') {
            finalResponse.type = 'chart';
            finalResponse.data = resultData;
        } else {
            finalResponse.type = 'table';
            finalResponse.data = resultData;
        }

        return finalResponse;
        
    } catch (error) {
        console.error("NLP Query Engine Error:", error);
        return {
            success: false,
            error: 'DATABASE_ERROR',
            message: "I couldn't retrieve that information from the database right now. Please try again."
        };
    }
};

module.exports = { parseAndExecuteNLPQuery };
