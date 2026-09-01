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
const parseAndExecuteNLPQuery = async (message) => {
    const msg = message.toLowerCase().trim();
    
    // 1. Determine the Entity (Model)
    let modelName = null;
    let baseWhere = {};
    let include = [];
    let order = [['createdAt', 'DESC']]; // default order
    
    // Intent flags
    let intent = 'FIND_ALL'; // Default: FIND_ALL, COUNT, SUM, FIND_SPECIFIC, TOP
    let targetName = null;
    let targetId = null;
    
    // Check intents first
    if (msg.match(/how many|no of|number of|count/)) intent = 'COUNT';
    else if (msg.includes('total') && (msg.includes('revenue') || msg.includes('value') || msg.includes('amount') || msg.includes('sales'))) intent = 'SUM';
    else if (msg.match(/find (invoice|po-|purchase order) (.+)/)) {
        const match = msg.match(/find (invoice|po-|purchase order) (.+)/);
        intent = 'FIND_SPECIFIC';
        targetId = match[2].trim().replace(/\.$/, ''); // remove trailing dot
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
    } else if (msg.includes('employee') || msg.includes('manager') || msg.includes('hr')) {
        modelName = 'Employee';
        if (msg.includes('hr')) baseWhere.department = { [Op.like]: '%HR%' };
        if (msg.includes('manager')) baseWhere.role = { [Op.like]: '%Manager%' };
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
        if (msg.includes('this month')) {
            const start = new Date(); start.setDate(1); start.setHours(0,0,0,0);
            baseWhere.createdAt = { [Op.gte]: start };
        } else if (msg.includes('today')) {
            const start = new Date(); start.setHours(0,0,0,0);
            baseWhere.createdAt = { [Op.gte]: start };
        }
        if (intent === 'TOP' && msg.includes('customer')) {
             // Handle "Which customer generated the most revenue"
             modelName = 'Order'; // Will aggregate Orders by customer
             intent = 'TOP_CUSTOMER_REVENUE';
        }
    } else if (msg.includes('material') || msg.includes('inventory') || msg.includes('stock')) {
        modelName = 'Material';
        if (msg.includes('low stock')) baseWhere.status = 'Low Stock'; 
        if (msg.includes('total') && msg.includes('value')) intent = 'SUM_INVENTORY';
    } else if (msg.includes('invoice') || msg.includes('ocr')) {
        modelName = 'OCRDocument';
        baseWhere.documentType = 'Invoice';
        if (msg.includes('latest')) order = [['createdAt', 'DESC']];
    } else if (msg.includes('vendor')) {
        modelName = 'Vendor';
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
            message: `I couldn't connect to the database right now (Model ${modelName} not found).`
        };
    }

    const Model = ModelClass.sequelizeModel || ModelClass;

    try {
        let resultData = null;
        let replyMessage = "";
        let visualType = "table";

        // Execute Intent
        if (intent === 'COUNT') {
            const count = await Model.count({ where: baseWhere });
            replyMessage = `There are ${count} ${modelName.toLowerCase()}s in the database.`;
            visualType = "metric";
            resultData = count;
        } 
        else if (intent === 'SUM') {
            let sumField = 'totalAmount'; // Default for orders
            if (modelName === 'OCRDocument') sumField = 'totalAmount'; // ensure schema matches
            const sum = await Model.sum(sumField, { where: baseWhere });
            replyMessage = `The total is ₹${sum || 0}.`;
            visualType = "metric";
            resultData = sum || 0;
        }
        else if (intent === 'SUM_INVENTORY') {
            // Need to sum quantity * unitPrice... usually sequelize sum on a formula isn't simple without literal
            // Fallback to simple sum of value or fetch and calculate
            const items = await Model.findAll({ where: baseWhere, raw: true });
            const total = items.reduce((acc, item) => acc + ((item.quantity || 0) * (item.price || 0)), 0);
            replyMessage = `The total inventory value is ₹${total}.`;
            visualType = "metric";
            resultData = total;
        }
        else if (intent === 'FIND_SPECIFIC') {
            if (targetId) {
                // Check common ID fields
                let specificWhere = { ...baseWhere };
                if (modelName === 'Order') specificWhere.orderNumber = { [Op.like]: `%${targetId}%` };
                else if (modelName === 'OCRDocument') specificWhere.documentNumber = { [Op.like]: `%${targetId}%` }; // Fallback
                
                const records = await Model.findAll({ where: specificWhere, include, limit: 10, order, raw: true, nest: true });
                if (records.length === 0) {
                    return { success: true, type: 'text', message: `No ${modelName.toLowerCase()} matching "${targetId}" was found.` };
                }
                resultData = records;
                replyMessage = `Here are the details for ${targetId}:`;
            } else if (targetName) {
                // Find by name
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
            // Aggregate Orders by customer
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
                resultData = records;
                replyMessage = "Here are the top customers by revenue:";
            } else {
                return { success: false, error: 'DATABASE_ERROR', message: "Unable to find customer relations." };
            }
        }
        else {
            // FIND_ALL — Parse limit from the query (e.g. 'latest 5', 'top 10', 'first 3')
            let limit = 50;
            const numMatch = msg.match(/(?:latest|last|top|first|show me|get)\s+(\d+)/);
            if (numMatch) {
                limit = parseInt(numMatch[1], 10);
            } else if (msg.includes('first 10') || msg.includes('top 10')) {
                limit = 10;
            }
            const records = await Model.findAll({ where: baseWhere, include, limit, order, raw: true, nest: true });
            if (records.length === 0) {
                // Return a useful 'no records' response instead of crashing the visual layer
                return {
                    success: true,
                    type: 'count',
                    title: modelName,
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

        console.log("[ARIA] Question:", message);
        console.log("[ARIA] Intent:", intent);
        console.log("[ARIA] Entity:", modelName);
        console.log("[ARIA] SQL parameters:", JSON.stringify({ where: baseWhere, include }));
        
        let finalResponse = {
            success: true,
            type: visualType,
            title: modelName,
            source: 'Live Database',
            message: replyMessage,
            answer: replyMessage
        };

        if (visualType === 'metric' && intent === 'COUNT') {
            finalResponse.type = 'count';
            finalResponse.value = resultData;
            finalResponse.formattedValue = resultData.toString();
        } else if (visualType === 'metric' && (intent === 'SUM' || intent === 'SUM_INVENTORY')) {
            finalResponse.type = 'aggregate';
            finalResponse.value = resultData;
            finalResponse.formattedValue = `₹${resultData.toLocaleString()}`;
        } else {
            finalResponse.type = 'table';
            finalResponse.data = resultData;
        }

        console.log("[ARIA] Result:", finalResponse.type === 'table' ? `[Table with ${finalResponse.data ? finalResponse.data.length : 0} rows]` : finalResponse.value);

        return finalResponse;
        
    } catch (error) {
        console.error("NLP Query Engine Error:", error);
        return {
            success: false,
            error: 'DATABASE_ERROR',
            message: "I couldn't connect to the database right now."
        };
    }
};

module.exports = { parseAndExecuteNLPQuery };
