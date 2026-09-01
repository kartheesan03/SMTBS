require('dotenv').config();
const { parseAndExecuteNLPQuery } = require('./src/services/nlpQueryEngine');

const tests = [
    "no of employee",
    "How many employees are there?",
    "How many customers are there?",
    "How many purchase orders are there?",
    "Show all employees",
    "Show all customers",
    "Show all purchase orders",
    "What is the total sales revenue?",
    "How many materials are in inventory?",
    "Show low stock materials",
    "What is the total purchase order value?",
    "Show the latest 5 purchase orders",
];

async function run() {
    for (const q of tests) {
        const r = await parseAndExecuteNLPQuery(q);
        const summary = r.type === 'table'
            ? `TABLE [${r.data ? r.data.length : 0} rows]`
            : `${r.type?.toUpperCase()}: ${r.formattedValue || r.value}`;
        console.log(`[${r.success ? 'OK' : 'FAIL'}] "${q}"\n       -> ${summary}\n`);
    }
}
run();
