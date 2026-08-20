require('dotenv').config();
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.MYSQL_URL, { dialect: 'mysql' });
async function check() {
    try {
        const [results] = await sequelize.query('SHOW TABLES;');
        console.log(results);
    } catch (e) {
        console.log(e.message);
    } finally {
        process.exit();
    }
}
check();
