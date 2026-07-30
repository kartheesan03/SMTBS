const sequelize = require('./src/config/sequelize');

async function fix() {
    try {
        await sequelize.query("UPDATE Employee SET contact='admin@smtbms.com' WHERE employeeId='EMP001' OR contact='system.admin@smtbms.com'");
        console.log("Fixed employee email");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
fix();
