const sequelize = require('./src/config/sequelize');
async function run() {
    await sequelize.authenticate();
    const [cols] = await sequelize.query("PRAGMA table_info(Employee);");
    console.log('Employee columns:', cols.map(c => c.name));
    process.exit(0);
}
run();
