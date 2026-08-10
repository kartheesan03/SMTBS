require('dotenv').config();
const sequelize = require('./src/config/sequelize');

async function clean() {
    try {
        console.log('Disabling foreign key checks...');
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
        console.log('Syncing and dropping all data...');
        // Drop all tables
        await sequelize.drop();
        await sequelize.sync({ force: true });
        console.log('Database wiped completely.');
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
        
        console.log('Running seed-admin.js...');
        require('./seed-admin.js');
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
clean();
