const sequelize = require('./src/config/sequelize');

async function checkTables() {
    await sequelize.authenticate();
    const [results, metadata] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table';");
    console.log(results);
    process.exit(0);
}
checkTables();
