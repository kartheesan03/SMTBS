const sequelize = require('./src/config/sequelize');
const Vendor = require('./src/models/Vendor');

async function fixVendor() {
    try {
        await sequelize.authenticate();
        console.log('Syncing Vendor table with alter: true...');
        await Vendor.sequelizeModel.sync({ alter: true });
        console.log('Done!');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
fixVendor();
