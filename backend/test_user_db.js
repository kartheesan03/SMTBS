const { Sequelize } = require('sequelize');
const path = require('path');

async function run() {
    const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, 'database.sqlite'),
        logging: false
    });
    
    try {
        const [users] = await sequelize.query("SELECT id, name, email FROM User");
        console.log("Users in DB:");
        console.table(users);
        
        const [dups] = await sequelize.query("SELECT id, count(*) as count FROM User GROUP BY id HAVING count(*) > 1");
        console.log("Duplicate IDs:", dups);

    } catch(err) {
        console.error(err);
    }
}
run();
