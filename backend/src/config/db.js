const sequelize = require('./sequelize');
const setupAssociations = require('../models/associations');

const connectDB = async () => {
    try {
        console.log('Target SQLite database verified/created.');

        // Authenticate database connection
        await sequelize.authenticate();
        console.log('SQLite Connection established successfully via Sequelize.');

        // Establish structural associations between tables
        setupAssociations();

        // Synchronize Sequelize schemas with database
        await sequelize.sync();
        console.log('SQLite Database tables synchronized and updated.');
        return true;
    } catch (error) {
        console.error('\n******************************************************************************');
        console.error('  DATABASE CONNECTION / MIGRATION ERROR:');
        console.error(`  Message: ${error.message}`);
        console.error('******************************************************************************\n');
        return false;
    }
};

module.exports = connectDB;