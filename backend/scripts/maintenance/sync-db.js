const sequelize = require('../../src/config/sequelize');
const setupAssociations = require('../../src/models/associations');
const Vendor = require('../../src/models/Vendor');
const Material = require('../../src/models/Material');
const VendorMaterial = require('../../src/models/VendorMaterial');

const syncDB = async () => {
    try {
        await sequelize.authenticate();
        setupAssociations();
        
        // Use alter: true to safely add new columns without dropping data
        await Vendor.sequelizeModel.sync({ alter: true });
        await VendorMaterial.sequelizeModel.sync({ alter: true });
        
        console.log("Database synchronized successfully!");
        process.exit(0);
    } catch (err) {
        console.error("DB Sync error:", err);
        process.exit(1);
    }
};

syncDB();
