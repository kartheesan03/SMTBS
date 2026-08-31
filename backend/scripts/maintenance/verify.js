const fs = require('fs');
const path = require('path');
const sequelize = require('../../src/config/sequelize');
const Vendor = require('../../src/models/Vendor');
const Material = require('../../src/models/Material');
const VendorMaterial = require('../../src/models/VendorMaterial');

async function verify() {
    await sequelize.authenticate();
    console.log('DB connected.');

    const vendors = await Vendor.sequelizeModel.findAll();
    console.log(`Found ${vendors.length} vendors in DB. (Expected >= 8)`);

    const vendorMaterials = await VendorMaterial.sequelizeModel.findAll();
    console.log(`Found ${vendorMaterials.length} VendorMaterial links. (Expected >= 19)`);

    const materials = await Material.sequelizeModel.findAll();
    console.log(`Found ${materials.length} Materials. (Expected >= 19)`);

    const ven1 = vendors.find(v => v.vendorCode === 'VEN-001');
    if (ven1) {
        const v1Links = await VendorMaterial.sequelizeModel.findAll({ where: { vendorId: ven1.id } });
        console.log(`Vendor VEN-001 has ${v1Links.length} materials. (Expected 5)`);
    }

    console.log('Verification DB script complete.');
    process.exit(0);
}

verify().catch(e => {
    console.error(e);
    process.exit(1);
});
