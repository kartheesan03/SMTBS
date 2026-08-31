const seq = require('../../src/config/sequelize');

async function run() {
    const rows = await seq.query("SELECT id, customerCode, name, status FROM Customer ORDER BY id DESC LIMIT 15", { type: 'SELECT' });
    console.log(`=== Customers in DB (${rows.length} rows) ===`);
    rows.forEach(r => console.log(r.id, r.customerCode, r.name, r.status));
}
run().catch(e => console.error('Error:', e.message));
