require('dotenv').config();
const { Sequelize } = require('sequelize');
const sequelize = require('./src/config/sequelize');

async function verify() {
    await sequelize.authenticate();
    
    console.log("=== 1. Total Movements Count ===");
    const [movCount] = await sequelize.query('SELECT COUNT(*) as c FROM MaterialMovement');
    console.log(movCount[0].c);

    console.log("\n=== 2. Orphaned Movements Check ===");
    const [orphaned] = await sequelize.query(`
        SELECT m.* FROM MaterialMovement m
        LEFT JOIN Material mat ON m.materialId = mat.id
        WHERE mat.id IS NULL
    `);
    console.log("Orphaned count:", orphaned.length);
    if(orphaned.length > 0) console.log(orphaned);

    console.log("\n=== 3. Total Materials Count ===");
    const [matCount] = await sequelize.query('SELECT COUNT(*) as c FROM Material');
    console.log(matCount[0].c);

    console.log("\n=== 4. Materials with >= 1 Movement Cross-Check ===");
    const [matCoverage] = await sequelize.query(`
        SELECT mat.id, mat.name, mat.sku, COUNT(m.id) as movement_count
        FROM Material mat
        LEFT JOIN MaterialMovement m ON mat.id = m.materialId
        GROUP BY mat.id, mat.name, mat.sku
    `);
    const missing = matCoverage.filter(r => r.movement_count == 0);
    console.log("Materials with 0 movements:", missing.length);
    console.log("All Materials and their movement counts:");
    matCoverage.forEach(m => {
        console.log(`- ${m.name} (${m.sku}): ${m.movement_count} movement(s)`);
    });

    console.log("\n=== 5. Specific Row Data (SS Pipe & Stainless Steel Rod) ===");
    const [specific] = await sequelize.query(`
        SELECT m.id as movementId, m.materialId, mat.name, mat.sku, m.type, m.quantity, m.createdAt
        FROM MaterialMovement m
        JOIN Material mat ON m.materialId = mat.id
        WHERE mat.sku IN ('STL-SS-PIPE-1', 'STL-SS-ROD-10')
    `);
    console.table(specific);

    process.exit(0);
}

verify().catch(console.error);
