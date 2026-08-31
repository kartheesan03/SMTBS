const sequelize = require('../../src/config/sequelize');
const Material = require('../../src/models/Material');
const MaterialMovement = require('../../src/models/MaterialMovement');
const Employee = require('../../src/models/Employee');
const { v4: uuidv4 } = require('uuid');

async function createInitialMovements() {
    await sequelize.authenticate();
    console.log('DB connected.');

    const materials = await Material.sequelizeModel.findAll();
    console.log(`Found ${materials.length} Materials.`);

    const systemEmployee = await Employee.sequelizeModel.findOne({ where: { department: 'Admin' } }) || { id: 1, firstName: 'System' };

    let created = 0;

    for (const material of materials) {
        const existingTx = await MaterialMovement.sequelizeModel.findOne({
            where: { materialId: material.id }
        });

        if (!existingTx && material.quantity > 0) {
            await MaterialMovement.sequelizeModel.create({
                materialId: material.id,
                type: 'IN',
                quantity: material.quantity,
                reference: 'Initial Stock Upload',
                performedBy: systemEmployee.id,
                location: material.warehouse || 'WH-A',
                status: 'Completed',
                notes: 'Generated via Vendor Seed'
            });
            created++;
        }
    }

    console.log(`Created ${created} new IN movements for seeded materials.`);
    process.exit(0);
}

createInitialMovements().catch(e => {
    console.error(e);
    process.exit(1);
});
