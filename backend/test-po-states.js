const sequelize = require('./src/config/sequelize');

(async () => {
    try {
        const mode = process.argv[2];
        await sequelize.authenticate();
        
        if (mode === 'zero') {
            await sequelize.query(`UPDATE "Order" SET orderType = 'purchase_hidden' WHERE orderType = 'purchase'`);
            console.log('Set to ZERO purchase orders');
        } else if (mode === 'one') {
            await sequelize.query(`UPDATE "Order" SET orderType = 'purchase_hidden' WHERE orderType = 'purchase'`);
            await sequelize.query(`UPDATE "Order" SET orderType = 'purchase', status = 'Received' WHERE id = (SELECT id FROM "Order" WHERE orderType = 'purchase_hidden' LIMIT 1)`);
            console.log('Set to ONE purchase order (Received)');
        } else if (mode === 'multi') {
            await sequelize.query(`UPDATE "Order" SET orderType = 'purchase' WHERE orderType = 'purchase_hidden'`);
            const [orders] = await sequelize.query(`SELECT id FROM "Order" WHERE orderType = 'purchase' LIMIT 3`);
            if(orders.length >= 3) {
                await sequelize.query(`UPDATE "Order" SET status = 'Received' WHERE id = ${orders[0].id}`);
                await sequelize.query(`UPDATE "Order" SET status = 'Approved' WHERE id = ${orders[1].id}`);
                await sequelize.query(`UPDATE "Order" SET status = 'Pending' WHERE id = ${orders[2].id}`);
            }
            console.log('Set to MULTIPLE purchase orders');
        } else if (mode === 'restore') {
            await sequelize.query(`UPDATE "Order" SET orderType = 'purchase' WHERE orderType = 'purchase_hidden'`);
            console.log('Restored all purchase orders');
        } else {
            const [result] = await sequelize.query(`SELECT COUNT(*) as count FROM "Order" WHERE orderType = 'purchase'`);
            console.log(`Current purchase orders: ${result[0].count}`);
        }
    } catch (e) {
        console.error(e);
    }
    process.exit();
})();
