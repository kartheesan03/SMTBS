require('dotenv').config();
const sequelize = require('./src/config/sequelize');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        const [result] = await sequelize.query("DELETE FROM Employee WHERE phone='0000000000'");
        console.log('Deleted system employees.');

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        process.exit(0);
    }
})();
