const sequelize = require('./src/config/sequelize');

async function verifyDB() {
    try {
        const [results] = await sequelize.query("PRAGMA table_info(Customer);");
        console.log('Columns in Customer table:', results.map(r => r.name));
    } catch (err) {
        console.error('Error:', err.message);
    }
}

verifyDB();
