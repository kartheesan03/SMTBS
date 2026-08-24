const { Sequelize } = require('sequelize');
const path = require('path');

async function run() {
    const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, 'database.sqlite'),
        logging: false
    });
    
    try {
        const [types] = await sequelize.query("SELECT id, typeof(id) as type FROM User");
        console.table(types);
    } catch(err) {
        console.error(err);
    }
}
run();
