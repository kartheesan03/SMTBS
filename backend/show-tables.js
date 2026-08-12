const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.MYSQL_URL, {
    dialect: 'mysql',
    logging: false
});

async function run() {
    await sequelize.authenticate();
    const [results] = await sequelize.query('SHOW TABLES');
    console.log(results);
    await sequelize.close();
}

run().catch(e => { console.error(e.message); });
