const { Sequelize } = require('sequelize');
const path = require('path');

async function dumpSchema() {
    const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, 'database.sqlite'),
        logging: false
    });

    try {
        await sequelize.authenticate();
        
        console.log("=== SCHEMA DDL ===");
        const [results] = await sequelize.query("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
        
        for (const row of results) {
            console.log(`\n-- Table: ${row.name}`);
            console.log(row.sql);
        }
    } catch (err) {
        console.error('Error connecting to DB:', err);
    } finally {
        await sequelize.close();
    }
}

dumpSchema();
