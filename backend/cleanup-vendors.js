const sequelize = require('./src/config/sequelize');

async function removeLeadVendors() {
    try {
        await sequelize.authenticate();
        await sequelize.query(`DELETE FROM Vendor WHERE category = 'From Lead';`);
        console.log("Deleted lead-converted vendors.");
    } catch(e) {
        console.error(e);
    }
}
removeLeadVendors();
