const { Sequelize } = require('sequelize');
const path = require('path');

async function cleanStaleTables() {
    const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, 'database.sqlite'),
        logging: false
    });

    try {
        await sequelize.authenticate();
        console.log("Connected to DB.");

        const [tables] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
        
        for (const table of tables) {
            const tableName = table.name;
            if (tableName.endsWith('_backup') || tableName.endsWith('_temp_migration')) {
                console.log(`Dropping stale table: ${tableName}`);
                await sequelize.query(`DROP TABLE IF EXISTS "${tableName}"`);
            }
        }
        console.log("Cleanup complete!");
    } catch (err) {
        console.error('Error during cleanup:', err);
    } finally {
        await sequelize.close();
    }
}

cleanStaleTables();
