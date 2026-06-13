const sequelize = require('./src/config/sequelize');

async function fixCols() {
    try {
        console.log('Fixing Customer...');
        await sequelize.query('ALTER TABLE Customer ADD COLUMN userId INTEGER;');
        console.log('Customer userId added');
    } catch(e) { console.error('Customer:', e.message); }

    try {
        console.log('Fixing Vendor...');
        await sequelize.query('ALTER TABLE Vendor ADD COLUMN userId INTEGER;');
        console.log('Vendor userId added');
    } catch(e) { console.error('Vendor:', e.message); }

    try {
        const [orderCols] = await sequelize.query('PRAGMA table_info("Order");');
        console.log('Order:', orderCols.map(c => c.name));
    } catch(e) { console.error('Order PRAGMA:', e.message); }
    process.exit();
}

fixCols();
