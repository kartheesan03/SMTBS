require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.MYSQL_URL, { dialect: 'mysql' });

async function queryPosts() {
    try {
        const [results] = await sequelize.query('SELECT * FROM `Post`;');
        console.log("Found posts:", results.length);
        console.log(results);
    } catch (e) {
        console.log(e.message);
    } finally {
        process.exit();
    }
}
queryPosts();
