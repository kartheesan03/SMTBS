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
const aiToolsDeclarations = {
    functionDeclarations: [
        {
            name: "query_database",
            description: "Query ANY table in the database to fetch records based on specific criteria. Supports all system models (e.g. Employee, Material, Order, Vendor, Attendance, Task, Project, etc).",
            parameters: {
                type: "OBJECT",
                properties: {
                    modelName: {
                        type: "STRING",
                        description: "The EXACT case-sensitive name of the database model to query (e.g., 'Material', 'Employee', 'Vendor', 'Order', 'Customer', 'Leave', 'Attendance')."
                    },
                    whereClause: {
                        type: "OBJECT",
                        description: "A JSON object representing the exact where clause to filter records. Supports simple matching ({\"status\": \"Pending\"}) and advanced operators (e.g., {\"amount\": {\"$gt\": 1000}}, {\"status\": {\"$in\": [\"Active\", \"Pending\"]}}). Supports $gt, $gte, $lt, $lte, $in, $ne."
                    }
                },
                required: ["modelName"]
            }
        },
        {
            name: "generate_report",
            description: "Generate a downloadable CSV report based on any database table.",
            parameters: {
                type: "OBJECT",
                properties: {
                    modelName: {
                        type: "STRING",
                        description: "The EXACT case-sensitive name of the database model to generate a report for (e.g., 'Material', 'Employee', 'Order')."
                    },
                    whereClause: {
                        type: "OBJECT",
                        description: "Optional. A JSON object representing the exact where clause to filter the report records."
                    }
                },
                required: ["modelName"]
            }
        },
        {
            name: "calculate_metrics",
            description: "Calculate aggregate metrics (SUM, COUNT, MIN, MAX) on a specific database table.",
            parameters: {
                type: "OBJECT",
                properties: {
                    modelName: {
                        type: "STRING",
                        description: "The database model name (e.g., 'Order', 'Material', 'Employee')."
                    },
                    operation: {
                        type: "STRING",
                        description: "The aggregation operation to perform: 'SUM', 'COUNT', 'MIN', 'MAX'."
                    },
                    field: {
                        type: "STRING",
                        description: "The exact database field name to perform the operation on (e.g., 'totalAmount', 'quantity'). Not required for 'COUNT'."
                    },
                    whereClause: {
                        type: "OBJECT",
                        description: "Optional. A JSON object representing the exact where clause to filter records before aggregating. Supports $gt, $gte, $lt, $lte, $in, $ne."
                    }
                },
                required: ["modelName", "operation"]
            }
        }
    ]
};
const executeAITool = async (call) => {
    const name = call.name;
    const args = call.args;
    try {
        if (name === "query_database") {
            const { modelName, whereClause = {} } = args;
            const Model = getModel(modelName);
            if (!Model) {
                return { error: `Model '${modelName}' not found in the system.` };
            }
            const where = {};
            for (const [key, value] of Object.entries(whereClause)) {
                if (typeof value === 'object' && value !== null) {
                    let hasOp = false;
                    for (const [op, opVal] of Object.entries(value)) {
                        if (op === '$gt') { where[key] = { ...where[key], [Op.gt]: opVal }; hasOp = true; }
                        else if (op === '$gte') { where[key] = { ...where[key], [Op.gte]: opVal }; hasOp = true; }
                        else if (op === '$lt') { where[key] = { ...where[key], [Op.lt]: opVal }; hasOp = true; }
                        else if (op === '$lte') { where[key] = { ...where[key], [Op.lte]: opVal }; hasOp = true; }
                        else if (op === '$in') { where[key] = { ...where[key], [Op.in]: Array.isArray(opVal) ? opVal : [opVal] }; hasOp = true; }
                        else if (op === '$ne') { where[key] = { ...where[key], [Op.ne]: opVal }; hasOp = true; }
                    }
                    if (!hasOp) where[key] = value;
                } else if (typeof value === 'string') {
                    where[key] = { [Op.like]: `%${value}%` };
                } else {
                    where[key] = value;
                }
            }
            const targetModel = Model.sequelizeModel || Model;
            const results = await targetModel.findAll({ where, limit: 50, raw: true });
            return {
                modelQuery: modelName,
                results: results
            };
        }
        
        if (name === "calculate_metrics") {
            const { modelName, field, operation, whereClause = {} } = args;
            const Model = getModel(modelName);
            if (!Model) return { error: `Model '${modelName}' not found.` };
            
            const where = {};
            for (const [key, value] of Object.entries(whereClause)) {
                if (typeof value === 'object' && value !== null) {
                    let hasOp = false;
                    for (const [op, opVal] of Object.entries(value)) {
                        if (op === '$gt') { where[key] = { ...where[key], [Op.gt]: opVal }; hasOp = true; }
                        else if (op === '$gte') { where[key] = { ...where[key], [Op.gte]: opVal }; hasOp = true; }
                        else if (op === '$lt') { where[key] = { ...where[key], [Op.lt]: opVal }; hasOp = true; }
                        else if (op === '$lte') { where[key] = { ...where[key], [Op.lte]: opVal }; hasOp = true; }
                        else if (op === '$in') { where[key] = { ...where[key], [Op.in]: Array.isArray(opVal) ? opVal : [opVal] }; hasOp = true; }
                        else if (op === '$ne') { where[key] = { ...where[key], [Op.ne]: opVal }; hasOp = true; }
                    }
                    if (!hasOp) where[key] = value;
                } else if (typeof value === 'string') {
                    where[key] = { [Op.like]: `%${value}%` };
                } else {
                    where[key] = value;
                }
            }
            
            const targetModel = Model.sequelizeModel || Model;
            let result;
            if (operation === 'COUNT') {
                result = await targetModel.count({ where });
            } else if (operation === 'SUM' && field) {
                result = await targetModel.sum(field, { where });
            } else if (operation === 'MIN' && field) {
                result = await targetModel.min(field, { where });
            } else if (operation === 'MAX' && field) {
                result = await targetModel.max(field, { where });
            }
            
            return {
                modelQuery: modelName,
                operation,
                field,
                result: result || 0
            };
        }
        if (name === "generate_report") {
            const { modelName, whereClause = {} } = args;
            const Model = getModel(modelName);
            if (!Model) {
                return { error: `Model '${modelName}' not found in the system.` };
            }
            const where = {};
            for (const [key, value] of Object.entries(whereClause)) {
                if (typeof value === 'string') {
                    where[key] = { [Op.like]: `%${value}%` };
                } else {
                    where[key] = value;
                }
            }
            const targetModel = Model.sequelizeModel || Model;
            const records = await targetModel.findAll({ where, raw: true });
            if (records.length === 0) {
                return { message: `No data found in ${modelName} for the given criteria.` };
            }
            const fileName = `${modelName}_report_${Date.now()}.csv`;
            const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads', 'reports');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            const filePath = path.join(uploadDir, fileName);
            const headers = Object.keys(records[0]);
            let csvContent = headers.join(",") + "\n";
            for (const row of records) {
                const values = headers.map(header => {
                    let val = row[header];
                    if (val === null || val === undefined) return '""';
                    if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
                    return `"${String(val).replace(/"/g, '""')}"`;
                });
                csvContent += values.join(",") + "\n";
            }
            fs.writeFileSync(filePath, csvContent);
            return {
                success: true,
                message: `${modelName} report generated successfully.`,
                file: {
                    name: fileName,
                    url: `/uploads/reports/${fileName}`,
                    size: fs.statSync(filePath).size,
                    type: 'csv'
                }
            };
        }
        return { error: `Tool ${name} not found.` };
    } catch (error) {
        console.error("Tool execution error:", error);
        return { error: error.message };
    }
};
module.exports = {
    aiToolsDeclarations,
    executeAITool
};
