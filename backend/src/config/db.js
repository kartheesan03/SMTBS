const sequelize = require('./sequelize');
const setupAssociations = require('../models/associations');

const safelyRecreateTable = async (modelName) => {
    const Model = sequelize.models[modelName];
    if (!Model) return;

    const tableName = Model.tableName;
    const tempTableName = `${tableName}_temp_migration`;

    try {
        console.log(`Safely recreating table ${tableName}...`);
        // Disable foreign keys temporarily
        await sequelize.query('PRAGMA foreign_keys = OFF;');

        // Check if table exists
        const [tableExists] = await sequelize.query(`SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}';`);
        
        if (tableExists.length > 0) {
            // Get current columns
            const [columns] = await sequelize.query(`PRAGMA table_info('${tableName}');`);
            const currentCols = columns.map(c => c.name);
            
            // Get model columns
            const modelCols = Object.keys(Model.getAttributes());
            
            // Find common columns
            const commonCols = currentCols.filter(c => modelCols.includes(c));
            
            // Create temp table with data
            await sequelize.query(`DROP TABLE IF EXISTS "${tempTableName}";`);
            await sequelize.query(`CREATE TABLE "${tempTableName}" AS SELECT * FROM "${tableName}";`);
            
            // Drop original table
            await sequelize.query(`DROP TABLE "${tableName}";`);
            
            // Recreate table with new schema
            await Model.sync();
            
            // Copy data back
            if (commonCols.length > 0) {
                const colsStr = commonCols.map(c => `"${c}"`).join(', ');
                await sequelize.query(`INSERT INTO "${tableName}" (${colsStr}) SELECT ${colsStr} FROM "${tempTableName}";`);
            }
            
            // Drop temp table
            await sequelize.query(`DROP TABLE "${tempTableName}";`);
        } else {
            // Just sync if it doesn't exist
            await Model.sync();
        }

        // Re-enable foreign keys
        await sequelize.query('PRAGMA foreign_keys = ON;');
        console.log(`Successfully recreated table ${tableName} with latest schema.`);
    } catch (error) {
        console.error(`Failed to recreate table ${tableName}:`, error.message);
        await sequelize.query('PRAGMA foreign_keys = ON;');
    }
};

const connectDB = async () => {
    try {
        console.log('Target SQLite database verified/created.');

        // Authenticate database connection
        await sequelize.authenticate();
        console.log('SQLite Connection established successfully via Sequelize.');

        // Establish structural associations between tables
        setupAssociations();

        // 1. Remove any stale backup tables
        try {
            const [tables] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND (name LIKE '%_backup' OR name LIKE '%_temp_migration');");
            for (let row of tables) {
                await sequelize.query(`DROP TABLE IF EXISTS "${row.name}";`);
                console.log(`Dropped stale table: ${row.name}`);
            }
        } catch (e) {
            console.log('Error cleaning up stale tables:', e.message);
        }

        // 2. Safely recreate User table to apply schema changes without alter: true bugs
        // Ensure this runs gracefully
        await safelyRecreateTable('User');

        // 3. Synchronize Sequelize schemas with database safely (without alter: true)
        await sequelize.sync();
        console.log('SQLite Database tables synchronized.');
        
        return true;
    } catch (error) {
        console.error('\n******************************************************************************');
        console.error('  DATABASE CONNECTION / MIGRATION ERROR:');
        console.error(`  Message: ${error.message}`);
        if (error.errors) {
            console.error('  Validation Details:', JSON.stringify(error.errors, null, 2));
        }
        console.error(`  Stack: ${error.stack}`);
        console.error('******************************************************************************\n');
        return false;
    }
};

module.exports = connectDB;