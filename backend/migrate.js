const sequelize = require('./src/config/sequelize');
require('./src/models/associations');

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        
        // This will add missing columns to existing tables
        await sequelize.sync({ alter: true });
        console.log('All models were synchronized successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
}

migrate();
