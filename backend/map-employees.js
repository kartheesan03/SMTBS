require('dotenv').config();
const sequelize = require('./src/config/sequelize');

(async () => {
    try {
        await sequelize.authenticate();
        
        await sequelize.query("UPDATE Employee SET userIdField = 28, contact = 'admin@smtbms.com' WHERE employeeId = 'EMP002'");
        await sequelize.query("UPDATE User SET name = 'Karthik Rajan' WHERE id = 28");
        await sequelize.query("DELETE FROM User WHERE id = 24");

        await sequelize.query("UPDATE Employee SET userIdField = 23, contact = 'hr@smtbms.com' WHERE employeeId = 'EMP003'");
        await sequelize.query("UPDATE User SET name = 'Priya Sharma' WHERE id = 23");
        await sequelize.query("DELETE FROM User WHERE id = 26");

        await sequelize.query("UPDATE Employee SET userIdField = 7, contact = 'sales@smtbms.com' WHERE employeeId = 'EMP004'");
        await sequelize.query("UPDATE User SET name = 'Arun Kumar' WHERE id = 7");
        await sequelize.query("DELETE FROM User WHERE id = 27");

        await sequelize.query("UPDATE Employee SET userIdField = 8, contact = 'employee@smtbms.com' WHERE employeeId = 'EMP005'");
        await sequelize.query("UPDATE User SET name = 'Suresh Babu' WHERE id = 8");
        await sequelize.query("DELETE FROM User WHERE id = 25");

        console.log('Successfully mapped all employees to role-based system accounts!');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
