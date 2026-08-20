require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.MYSQL_URL, { dialect: 'mysql' });

async function deleteAdminTest() {
    try {
        const [users] = await sequelize.query('SELECT id FROM `User` WHERE name = "Admin Test";');
        console.log("Found users:", users);
        if (users.length > 0) {
            for (let user of users) {
                console.log(`Deleting user ID: ${user.id}`);
                await sequelize.query(`DELETE FROM \`User\` WHERE id = ${user.id};`);
                // Also delete from Customer if they were created as Customer
                await sequelize.query(`DELETE FROM \`Customer\` WHERE userId = ${user.id};`);
            }
            console.log("Deleted Admin Test login completely.");
        } else {
            console.log("No Admin Test found.");
        }
    } catch (e) {
        console.log(e.message);
    } finally {
        process.exit();
    }
}
deleteAdminTest();
