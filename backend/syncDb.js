const sequelize = require('./src/config/sequelize');

async function checkSchema() {
    try {
        const [results] = await sequelize.query('PRAGMA table_info(User);');
        console.log(results);
    } catch (e) {
        console.error(e);
    }
    process.exit();
}

checkSchema();
