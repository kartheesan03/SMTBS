require('dotenv').config();
const connectDB = require('./src/config/db');
const sequelize = require('./src/config/sequelize');

async function fixForeignKeys() {
    await connectDB();
    try {
        console.log('Adding new FK on Employee...');
        await sequelize.query('ALTER TABLE Employee ADD CONSTRAINT Employee_ibfk_1 FOREIGN KEY (userIdField) REFERENCES User (id) ON DELETE SET NULL ON UPDATE CASCADE').catch(e => console.log('Err:', e.message));
        
        console.log('Done!');
        process.exit(0);
    } catch (e) {
        console.error('General Error:', e.message);
        process.exit(1);
    }
}
fixForeignKeys();
