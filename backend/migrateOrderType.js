require('dotenv').config();
const sequelize = require('./src/config/sequelize');

sequelize.authenticate().then(async () => {
    try {
        await sequelize.query("ALTER TABLE `order` MODIFY COLUMN orderType ENUM('purchase', 'sales', 'expense') NOT NULL");
        console.log("Column modified.");

        const [results, metadata] = await sequelize.query("UPDATE `order` SET orderType = 'expense' WHERE orderNumber LIKE 'EXP-OCR-%' OR workflow LIKE '%\"source\":\"OCR\"%'");
        console.log("Updated records:", metadata.affectedRows || metadata);
        
        console.log('Migration complete');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
});
