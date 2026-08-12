require('dotenv').config();
const sequelize = require('./src/config/sequelize');

async function fixTicketTable() {
    try {
        console.log('Adding missing columns to Ticket table...');
        try {
            await sequelize.query('ALTER TABLE `Ticket` ADD COLUMN `attachment` VARCHAR(255) DEFAULT NULL;');
            console.log('Successfully added attachment.');
        } catch (e) { console.log('attachment might already exist.'); }
        
        try {
            await sequelize.query('ALTER TABLE `Ticket` ADD COLUMN `assignedToId` INT DEFAULT NULL;');
            console.log('Successfully added assignedToId.');
        } catch (e) { console.log('assignedToId might already exist.'); }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit(0);
    }
}

fixTicketTable();
