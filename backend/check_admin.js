const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
});
async function run() {
    await sequelize.query("UPDATE User SET role='Admin' WHERE email='admin@smtbms.com';");
    const [users] = await sequelize.query("SELECT * FROM User WHERE email='admin@smtbms.com';");
    console.log(users);
}
run();
