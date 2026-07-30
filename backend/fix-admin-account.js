const bcrypt = require('bcryptjs');
const sequelize = require('./src/config/sequelize');

async function fix() {
    try {
        const hash = await bcrypt.hash('admin123', 10);
        // Ensure admin@smtbms.com doesn't exist
        await sequelize.query("DELETE FROM User WHERE email='admin@smtbms.com'");
        await sequelize.query(`UPDATE User SET email='admin@smtbms.com', password='${hash}' WHERE email='system.admin@smtbms.com'`);
        await sequelize.query(`UPDATE Employee SET contact='admin@smtbms.com' WHERE employeeId='EMP001' OR contact='system.admin@smtbms.com'`);
        
        console.log("Admin account restored to admin@smtbms.com/admin123");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
fix();
