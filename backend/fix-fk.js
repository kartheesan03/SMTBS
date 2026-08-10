require('dotenv').config();
const { Sequelize } = require('sequelize');
const sequelize = require('./src/config/sequelize');

async function fixForeignKeys() {
    try {
        await sequelize.authenticate();
        console.log("Connected to DB");

        // First, let's get the constraint name. From the error it is 'MaterialMovement_ibfk_1'
        const dropQuery = 'ALTER TABLE `MaterialMovement` DROP FOREIGN KEY `MaterialMovement_ibfk_1`;';
        try {
            await sequelize.query(dropQuery);
            console.log("Dropped incorrect foreign key MaterialMovement_ibfk_1");
        } catch(e) {
            console.log("Failed to drop foreign key, maybe it doesn't exist or name is different", e.message);
        }

        const addQuery = 'ALTER TABLE `MaterialMovement` ADD CONSTRAINT `MaterialMovement_ibfk_1` FOREIGN KEY (`materialId`) REFERENCES `Materials` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;';
        try {
            await sequelize.query(addQuery);
            console.log("Added correct foreign key to Materials table");
        } catch(e) {
            console.log("Failed to add new foreign key", e.message);
            // Maybe the table name is `Material` instead of `Materials`
            try {
                const addQuery2 = 'ALTER TABLE `MaterialMovement` ADD CONSTRAINT `MaterialMovement_ibfk_1` FOREIGN KEY (`materialId`) REFERENCES `Material` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;';
                await sequelize.query(addQuery2);
                console.log("Added correct foreign key to Material table");
            } catch (err2) {
                console.error("Also failed for Material table", err2.message);
            }
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixForeignKeys();
