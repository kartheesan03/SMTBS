require('dotenv').config();
const sequelize = require('./src/config/sequelize');

(async () => {
    try {
        await sequelize.authenticate();
        await sequelize.query("UPDATE Employee SET department = 'Admin' WHERE employeeId = 'EMP002'");
        await sequelize.query("UPDATE User SET role = 'Admin' WHERE email = 'karthik.rajan@smtbms.com'");
        console.log('Karthik Rajan role updated to Admin');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
