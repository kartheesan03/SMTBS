require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.MYSQL_URL, { dialect: 'mysql' });

async function deleteEmptyPost() {
    try {
        await sequelize.query('DELETE FROM `Post` WHERE id = 6;');
        console.log("Post ID 6 has been deleted.");
    } catch (e) {
        console.log(e.message);
    } finally {
        process.exit();
    }
}
deleteEmptyPost();
