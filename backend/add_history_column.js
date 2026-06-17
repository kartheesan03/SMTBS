const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
});

async function run() {
    try {
        await sequelize.query("ALTER TABLE StockRequest ADD COLUMN history TEXT DEFAULT '[]'");
        console.log("Column 'history' added to StockRequest.");
    } catch (e) {
        if (e.message.includes('duplicate column name')) {
            console.log("Column already exists.");
        } else {
            console.error("Error adding column:", e.message);
        }
    }
    process.exit(0);
}
run();
