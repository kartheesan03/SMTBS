const MaterialMovement = require('./src/models/MaterialMovement');
const Material = require('./src/models/Material');

async function run() {
  try {
    const movements = await MaterialMovement.find({});
    const materials = await Material.find({});
    const validMaterialIds = new Set(materials.map(m => m.id));
    
    let deletedCount = 0;
    for (const mov of movements) {
      if (!validMaterialIds.has(mov.materialId)) {
        await MaterialMovement.findByIdAndDelete(mov.id);
        deletedCount++;
      }
    }
    console.log(`Deleted ${deletedCount} orphaned movements.`);
  } catch (error) {
    console.error(error);
  }
}

run();
