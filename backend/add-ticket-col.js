require('dotenv').config();
const sequelize = require('./src/config/sequelize');

async function addSubmittedById() {
    try {
        console.log('Adding submittedById to Ticket table...');
        await sequelize.query('ALTER TABLE `Ticket` ADD COLUMN `submittedById` INT DEFAULT NULL;');
        console.log('Successfully added submittedById.');
    } catch (err) {
        if (err.message.includes('Duplicate column name')) {
            console.log('Column already exists.');
        } else {
            console.error('Error:', err);
        }
    } finally {
        process.exit(0);
    }
}

addSubmittedById();
