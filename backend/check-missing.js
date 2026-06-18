const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
});

async function run() {
    try {
        const [rows] = await sequelize.query("SELECT id, name, email, role FROM User;");
        console.table(rows);
    } catch (e) {
        console.error(e);
    }
}
run();
