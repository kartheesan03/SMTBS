const sequelize = require('./src/config/sequelize');

async function addMaterialsSuppliedColumn() {
    try {
        await sequelize.authenticate();
        console.log("Connected to SQLite database.");

        try {
            await sequelize.query(`ALTER TABLE Vendor ADD COLUMN materialsSupplied TEXT;`);
            console.log("Added materialsSupplied column to Vendor table.");
        } catch (e) {
            console.log("Column might already exist or error: ", e.message);
        }

    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        process.exit();
    }
}

addMaterialsSuppliedColumn();
