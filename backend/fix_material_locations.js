const sequelize = require('./src/config/sequelize');

async function run() {
    require('./src/models/associations');
    const Material = sequelize.models.Material;
    
    try {
        const materials = await Material.findAll();
        console.log(`Found ${materials.length} materials.`);
        
        let i = 1;
        for (const m of materials) {
            const warehouse = i % 2 === 0 ? 'Warehouse A' : 'Warehouse B';
            const shelf = `Shelf ${i % 5 + 1}`;
            
            await m.update({
                warehouse,
                shelf,
                location: `${warehouse} / ${shelf}`
            });
            i++;
        }
        
        console.log('All materials updated with locations.');
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

run();
