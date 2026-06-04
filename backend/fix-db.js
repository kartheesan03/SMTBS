const sequelize = require('./src/config/sequelize');
const setupAssociations = require('./src/models/associations');
const Vendor = require('./src/models/Vendor');

async function fixDB() {
    try {
        await sequelize.authenticate();
        setupAssociations();
        console.log('Syncing database with alter: true...');
        await sequelize.sync({ alter: true });
        console.log('Done!');
        
        const count = await Vendor.sequelizeModel.count();
        console.log('Vendor count:', count);
    } catch (e) {
        console.error(e);
    }
}
fixDB();
