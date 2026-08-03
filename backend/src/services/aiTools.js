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
                        description: "The EXACT case-sensitive name of the database model to query (e.g., 'Material', 'Employee', 'Vendor', 'Order', 'Leave', 'Attendance')."
                    },
                    whereClause: {
                        type: "OBJECT",
                        description: "A JSON object representing the exact where clause to filter records. For example, {\"status\": \"Pending\"} or {\"department\": \"Engineering\"}. Keep it simple."
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
                if (typeof value === 'string') {
                    where[key] = { [Op.like]: `%${value}%` };
                } else {
                    where[key] = value;
                }
            }
            const targetModel = Model.sequelizeModel || Model;
            const results = await targetModel.findAll({ where, limit: 15, raw: true });
            return {
                modelQuery: modelName,
                results: results
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
