const connectDB = require('./src/config/db');
const sequelize = require('./src/config/sequelize');

(async () => {
    try {
        await connectDB();
        const tableName = sequelize.models.Order.tableName;
        console.log(`Running migration: renaming type to orderType in ${tableName} table...`);
        
        await sequelize.query(`ALTER TABLE "${tableName}" RENAME COLUMN type TO orderType`);
        console.log('Column renamed successfully.');

        console.log('Converting data to lowercase...');
        await sequelize.query(`UPDATE "${tableName}" SET orderType = LOWER(orderType)`);
        console.log('Data converted successfully.');

    } catch (e) {
        console.log('Error during migration (maybe already migrated?):', e.message);
    }
    process.exit();
})();
