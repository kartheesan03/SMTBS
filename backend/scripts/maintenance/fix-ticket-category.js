require('dotenv').config();
const sequelize = require('./src/config/sequelize');

async function fixCategoryColumn() {
    try {
        console.log('Modifying category column from ENUM to VARCHAR(255)...');
        await sequelize.query("ALTER TABLE `Ticket` MODIFY COLUMN `category` VARCHAR(255) DEFAULT 'General Query';");
        
        console.log('Also modifying priority and status just in case they need it (optional)...');
        await sequelize.query("ALTER TABLE `Ticket` MODIFY COLUMN `priority` VARCHAR(255) DEFAULT 'Medium';");
        await sequelize.query("ALTER TABLE `Ticket` MODIFY COLUMN `status` VARCHAR(255) DEFAULT 'Open';");

        console.log('Successfully altered columns.');
    } catch (err) {
        console.error('Error modifying column:', err);
    } finally {
        process.exit(0);
    }
}

fixCategoryColumn();
