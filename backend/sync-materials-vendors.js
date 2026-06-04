const sequelize = require('./src/config/sequelize');
const Vendor = require('./src/models/Vendor');
const Material = require('./src/models/Material');
require('./src/models/associations')();

const syncMaterials = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');

        // Execute ALTER TABLE to add vendorId in case Sequelize doesn't do it automatically
        try {
            await sequelize.query('ALTER TABLE Material ADD COLUMN vendorId INTEGER;');
            console.log('Added vendorId column to Material table');
        } catch (e) {
            console.log('Column vendorId might already exist or error: ', e.message);
        }

        const mappings = {
            'Sri Lakshmi Steel Traders': ['TMT Steel Bars', 'MS Angle'],
            'Erode Welding Supplies': ['Welding Rod'],
            'Coimbatore Sheet Metal Works': ['Aluminum Sheet', 'SS Sheet'],
            'Madurai Cement Depot': ['Cement', 'Sand'],
            'Thirumurugan Pipes & Fittings': ['GI Pipes', 'PVC Conduit Pipe', 'Brass Fittings'],
            'Kumaran Electricals': ['Copper Wire', 'MCB Switch']
        };

        const vendors = await Vendor.find({});
        
        for (const [vendorName, materialsList] of Object.entries(mappings)) {
            // Find vendor
            let vendor = vendors.find(v => v.name.toLowerCase() === vendorName.toLowerCase());
            if (!vendor) {
                console.log(`Vendor not found, creating: ${vendorName}`);
                vendor = await Vendor.create({
                    name: vendorName,
                    category: 'Raw Materials',
                    status: 'Approved Vendor',
                    email: vendorName.replace(/\s+/g, '').toLowerCase() + '@example.com',
                    phone: '9999999999',
                    address: 'Tamil Nadu'
                });
            }

            // Update materials
            const allMaterials = await Material.find({});
            for (const matName of materialsList) {
                let material = allMaterials.find(m => m.name.toLowerCase().includes(matName.toLowerCase()));
                if (material) {
                    material.vendorId = vendor.id || vendor._id;
                    await material.save();
                    console.log(`Mapped ${material.name} -> ${vendor.name}`);
                } else {
                    console.log(`Material not found matching: ${matName}`);
                }
            }
        }
        console.log('Sync Complete');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

syncMaterials();
