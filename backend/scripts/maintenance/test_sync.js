const sequelize = require('./src/config/sequelize');
const setupAssociations = require('./src/models/associations');

async function run() {
    try {
        setupAssociations();
        await sequelize.query("PRAGMA foreign_keys = OFF;");
        await sequelize.query("DROP TABLE IF EXISTS `User_backup`;");
        console.log("Dropped User_backup if it existed.");
        await sequelize.models.User.sync({ alter: true });
        await sequelize.query("PRAGMA foreign_keys = ON;");
        console.log("Success!");
    } catch (err) {
        console.error("Global error:", err.message);
        if (err.original) {
            console.error("ORIGINAL DB ERROR:", err.original.message);
        }
    }
}
run();
