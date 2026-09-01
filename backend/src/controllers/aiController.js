const { GoogleGenerativeAI } = require('@google/generative-ai');
const sequelize = require('../config/sequelize');
const AICopilotLog = require('../models/AICopilotLog');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key_to_prevent_crash_if_not_set');
const rolePermissions = {
    Admin: {
        allowedTables: ['users', 'employees', 'attendance', 'leaves', 'salaries', 'materials', 'sales_goals', 'customers', 'vendors', 'orders', 'projects', 'tasks'],
        rls: (user) => ''
    },
    HR: {
        allowedTables: ['users', 'employees', 'attendance', 'leaves', 'salaries', 'recruitments'],
        rls: (user) => ''
    },
    Manager: {
        allowedTables: ['employees', 'attendance', 'leaves', 'tasks', 'projects', 'orders'],
        rls: (user) => {
            if (!user.department) return 'WHERE 1=0';
            return `/* MANDATORY: MUST filter by department = '${user.department}' for employees/attendance/leaves */`;
        }
    },
    Employee: {
        allowedTables: ['employees', 'attendance', 'leaves', 'salaries', 'tasks'],
        rls: (user) => {
            return `/* MANDATORY: MUST strictly filter by employeeId = ${user.id} in WHERE clauses */`;
        }
    },
    Sales: {
        allowedTables: ['customers', 'leads', 'orders', 'sales_goals'],
        rls: (user) => ''
    },
    Vendor: {
        allowedTables: ['orders', 'material_movements'],
        rls: (user) => {
            return `/* MANDATORY: MUST strictly filter by vendorId = ${user.vendorId || user.id} in WHERE clauses */`;
        }
    },
    Customer: {
        allowedTables: ['orders', 'tickets'],
        rls: (user) => {
            return `/* MANDATORY: MUST strictly filter by customerId = ${user.customerId || user.id} in WHERE clauses */`;
        }
    }
};
const getDatabaseSchema = (allowedTables) => {
    const schemas = {
        users: `CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT, role TEXT, active BOOLEAN, createdAt DATETIME);`,
        employees: `CREATE TABLE employees (id INTEGER PRIMARY KEY, userId INTEGER, firstName TEXT, lastName TEXT, department TEXT, designation TEXT, baseSalary REAL, joinDate DATETIME);`,
        attendance: `CREATE TABLE attendance (id INTEGER PRIMARY KEY, employeeId INTEGER, date DATE, status TEXT, checkIn TIME, checkOut TIME, workHours REAL, location TEXT);`,
        leaves: `CREATE TABLE leaves (id INTEGER PRIMARY KEY, employeeId INTEGER, type TEXT, startDate DATE, endDate DATE, status TEXT, reason TEXT);`,
        salaries: `CREATE TABLE salaries (id INTEGER PRIMARY KEY, employeeId INTEGER, month TEXT, year INTEGER, basic REAL, deductions REAL, netSalary REAL, status TEXT);`,
        materials: `CREATE TABLE materials (id INTEGER PRIMARY KEY, name TEXT, category TEXT, currentStock INTEGER, minStockLevel INTEGER, unitPrice REAL);`,
        customers: `CREATE TABLE customers (id INTEGER PRIMARY KEY, userId INTEGER, name TEXT, company TEXT, email TEXT, phone TEXT, status TEXT);`,
        vendors: `CREATE TABLE vendors (id INTEGER PRIMARY KEY, name TEXT, email TEXT, phone TEXT, category TEXT, status TEXT);`,
        orders: `CREATE TABLE orders (id INTEGER PRIMARY KEY, customerId INTEGER, vendorId INTEGER, type TEXT, status TEXT, totalAmount REAL, orderDate DATETIME);`,
        sales_goals: `CREATE TABLE sales_goals (id INTEGER PRIMARY KEY, target REAL, achieved REAL, month TEXT, year INTEGER);`
    };
    let schemaText = "";
    allowedTables.forEach(t => {
        if (schemas[t]) schemaText += schemas[t] + "\n";
    });
    return schemaText;
};
exports.askCopilot = async (req, res) => {
    const startTime = Date.now();
    const { question } = req.body;
    const user = req.user;
    if (!question) {
        return res.status(400).json({ message: "Question is required." });
    }
    if (!user || !user.role) {
        return res.status(403).json({ message: "Unauthorized. Role is missing." });
    }
    const roleData = rolePermissions[user.role];
    if (!roleData) {
        return res.status(403).json({ message: `Role ${user.role} is not supported by AI Copilot.` });
    }
    const allowedSchema = getDatabaseSchema(roleData.allowedTables);
    const rlsRule = roleData.rls(user);
    const systemPrompt = `You are an enterprise AI Database Copilot for an SQLite database.
You translate natural language questions into valid SQL queries based ONLY on the provided schema.
ROLE: ${user.role}
ALLOWED TABLES:
${allowedSchema}
MANDATORY ROW-LEVEL SECURITY (RLS) RULE:
${rlsRule}
SECURITY RULES:
1. ONLY generate SELECT queries. Never generate INSERT, UPDATE, DELETE, DROP, ALTER, PRAGMA.
2. If the user asks for data outside their allowed tables, return a JSON explaining they don't have permission, with an empty SQL string.
3. You MUST apply the MANDATORY RLS RULE to your WHERE clause if one is provided.
4. Output standard SQLite syntax.
5. You MUST return ONLY a JSON object in this exact format, with NO Markdown wrapping (\`\`\`json) outside the braces:
{
    "sql": "SELECT ...",
    "type": "table|chart|text",
    "explanation": "Brief business insight explaining the data..."
}
If the question is conversational or unanswerable, set "sql": "" and provide the answer in "explanation".
`;
    let generatedSql = "";
    let success = false;
    let errorMessage = null;
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent([
            { text: systemPrompt },
            { text: `Question: ${question}` }
        ]);
        let responseText = result.response.text().trim();
        if (responseText.startsWith('```json')) responseText = responseText.substring(7);
        if (responseText.startsWith('```')) responseText = responseText.substring(3);
        if (responseText.endsWith('```')) responseText = responseText.slice(0, -3);
        responseText = responseText.trim();
        let aiResponse;
        try {
            aiResponse = JSON.parse(responseText);
        } catch (e) {
            throw new Error("AI returned malformed JSON: " + responseText);
        }
        generatedSql = aiResponse.sql || "";
        let data = [];
        if (generatedSql) {
            const upperSql = generatedSql.toUpperCase();
            if (upperSql.includes('INSERT ') || upperSql.includes('UPDATE ') || upperSql.includes('DELETE ') || upperSql.includes('DROP ') || upperSql.includes('ALTER ')) {
                throw new Error("Malicious SQL detected and blocked.");
            }
            const [results] = await sequelize.query(generatedSql);
            data = results;
        }
        success = true;
        await AICopilotLog.create({
            userId: user.id,
            role: user.role,
            question: question,
            generatedSql: generatedSql,
            executionTimeMs: Date.now() - startTime,
            success: true
        }).catch(err => console.error("Failed to log AI Copilot request:", err));
        return res.json({
            success: true,
            type: aiResponse.type || 'text',
            explanation: aiResponse.explanation,
            data: data,
            sql: generatedSql
        });
    } catch (error) {
        errorMessage = error.message;
        console.error("AI Copilot Error:", error);
        await AICopilotLog.create({
            userId: user.id,
            role: user.role,
            question: question,
            generatedSql: generatedSql,
            executionTimeMs: Date.now() - startTime,
            success: false,
            errorMessage: errorMessage
        }).catch(err => console.error("Failed to log AI Copilot request:", err));
        return res.status(500).json({ 
            success: false, 
            message: "AI Copilot failed to process your request.",
            error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        });
    }
};
