require('dotenv').config();
const sequelize = require('./src/config/sequelize');

(async () => {
    try {
        await sequelize.authenticate();
        await sequelize.query("UPDATE Employee SET phone = '9876543214' WHERE employeeId = 'EMP002'");
        console.log('Phone number updated');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
