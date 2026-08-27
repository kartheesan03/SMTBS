require('dotenv').config();
const sequelize = require('./src/config/sequelize');

async function checkSchema() {
    try {
        const [results] = await sequelize.query("DESCRIBE Ticket;");
        console.log(results);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit(0);
    }
}

checkSchema();
