require('dotenv').config();
const sequelize = require('./src/config/sequelize');

(async () => {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query("SELECT * FROM Employee WHERE phone='0000000000'");
        console.log('Fake Employees Found:', results.length);
        if (results.length > 0) {
            console.log(JSON.stringify(results, null, 2));
        }
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        process.exit(0);
    }
})();
