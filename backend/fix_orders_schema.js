const sequelize = require('./src/config/sequelize');

async function fix() {
    try {
        await sequelize.authenticate();
        console.log("Connected");
        
        await sequelize.query(`ALTER TABLE "Order" ADD COLUMN "deliveredAt" DATETIME;`).catch(e => console.log("already exists or error", e.message));
        await sequelize.query(`ALTER TABLE "Order" ADD COLUMN "trackingTimeline" JSON;`).catch(e => console.log("already exists or error", e.message));
        
        const [orders] = await sequelize.query(`SELECT * FROM "Order"`);
        console.log(`Found ${orders.length} orders after sync.`);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit(0);
    }
}
fix();
