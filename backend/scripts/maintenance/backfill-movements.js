require('dotenv').config();
const connectDB = require('./src/config/db');
const Material = require('./src/models/Material');
const MaterialMovement = require('./src/models/MaterialMovement');

async function backfillMovements() {
    await connectDB();
    console.log("Connected to DB");

    const materials = await Material.find({});
    let backfillCount = 0;

    for (const material of materials) {
        if (material.quantity > 0) {
            const matId = material.id || material._id;
            
            // Check if any movements exist for this material
            const existingMovements = await MaterialMovement.find({ materialId: matId });
            
            if (existingMovements.length === 0) {
                console.log(`Backfilling movement for material: ${material.name} (SKU: ${material.sku})`);
                
                const movement = await MaterialMovement.sequelizeModel.create({
                    materialId: matId,
                    type: 'In',
                    quantity: material.quantity,
                    previousQuantity: 0,
                    newQuantity: material.quantity,
                    reason: 'Initial stock entry',
                    createdAt: material.createdAt || new Date(),
                    updatedAt: material.createdAt || new Date()
                });
                
                // For Sequelize, to force a specific createdAt we might need to update it
                // if it ignored our provided createdAt
                await MaterialMovement.sequelizeModel.update(
                    { createdAt: material.createdAt || new Date() },
                    { where: { id: movement.id }, silent: true }
                );

                backfillCount++;
            }
        }
    }

    console.log(`\n--- BACKFILL COMPLETE ---`);
    console.log(`Successfully created retroactive 'IN' movements for ${backfillCount} materials.`);
    process.exit(0);
}

backfillMovements().catch(err => {
    console.error(err);
    process.exit(1);
});
