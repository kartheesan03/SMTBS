const { GoogleGenerativeAI } = require('@google/generative-ai');
const sequelize = require('../config/sequelize');
const sqlValidator = require('./sqlValidator');
const generateAndExecuteSQL = async (user, naturalLanguageQuery) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('Gemini API key is not configured.');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const schemaContext = `
        Tables:
        - Users (id, name, email, role, active)
        - Employees (id, userId, department, position, joinDate)
        - Attendance (id, employeeId, date, status, checkInTime, checkOutTime)
        - Orders (id, customerId, totalAmount, status, orderDate)
        - Vendors (id, name, contactEmail, category, rating)
        - Materials (id, name, category, quantity, unit, price)
        - MaterialMovements (id, materialId, type, quantity, date, remarks)
        - Tasks (id, title, description, assignedTo, status, dueDate)
    `;
    const rbacContext = `
        The user making this request has the role: ${user.role}.
        If the user is an 'Employee', they can only query their own data (where employeeId or userId matches their own ID: ${user.id}).
        If the user is a 'Manager', they can only query data for their department.
        If the user is a 'Customer', they can only query their own orders.
        If the user is a 'Vendor', they can only query their own POs.
        Ensure you append appropriate WHERE clauses to enforce this Row-Level Security.
    `;
    const prompt = `
        You are an expert SQL generator for SQLite/MySQL. 
        Given the following schema and RBAC rules, generate a safe, read-only SELECT SQL query to answer the user's question.
        Schema:
        ${schemaContext}
        RBAC Rules:
        ${rbacContext}
        User Question: "${naturalLanguageQuery}"
        Output ONLY the raw SQL query. Do not include markdown code blocks, formatting, or explanations. Just the SQL.
    `;
    const result = await model.generateContent(prompt);
    let sqlQuery = result.response.text().trim();
    if (sqlQuery.startsWith('\`\`\`sql')) {
        sqlQuery = sqlQuery.replace(/^\`\`\`sql/, '').replace(/\`\`\`$/, '').trim();
    }
    sqlValidator.validate(sqlQuery);
    const [data] = await sequelize.query(sqlQuery);
    return {
        sql: sqlQuery,
        data: data
    };
};
module.exports = {
    generateAndExecuteSQL
};
