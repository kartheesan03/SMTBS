/**
 * migrate-material-delivery.js
 *
 * Adds delivery lifecycle fields to Materials table.
 *
 * Usage: node backend/scripts/migrate-material-delivery.js
 */

const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.resolve(__dirname, '../database.sqlite');

function runQuery(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

function allQuery(db, sql) {
    return new Promise((resolve, reject) => {
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

async function run() {
    console.log(`[migrate] Opening database at: ${DB_PATH}`);
    const db = new sqlite3.Database(DB_PATH);

    await runQuery(db, 'PRAGMA journal_mode=WAL');

    const table = 'Material';

    const cols = await allQuery(db, `PRAGMA table_info(${table})`);
    const existingColumns = new Set(cols.map(c => c.name));

    const columnsToAdd = [
        { name: 'deliveryDestination', sql: `ALTER TABLE ${table} ADD COLUMN deliveryDestination TEXT DEFAULT NULL` },
        { name: 'deliveryEta',         sql: `ALTER TABLE ${table} ADD COLUMN deliveryEta DATETIME DEFAULT NULL` },
        { name: 'deliveryDispatchedAt',sql: `ALTER TABLE ${table} ADD COLUMN deliveryDispatchedAt DATETIME DEFAULT NULL` },
        { name: 'deliveryCompletedAt', sql: `ALTER TABLE ${table} ADD COLUMN deliveryCompletedAt DATETIME DEFAULT NULL` }
    ];

    for (const col of columnsToAdd) {
        if (!existingColumns.has(col.name)) {
            console.log(`[migrate] Adding column: ${col.name}`);
            await runQuery(db, col.sql);
        } else {
            console.log(`[migrate] Column already exists, skipping: ${col.name}`);
        }
    }

    // Convert 'Stationary' to 'At Warehouse'
    const backfill = await runQuery(db,
        `UPDATE ${table}
         SET gpsStatus = 'At Warehouse'
         WHERE gpsStatus = 'Stationary'`
    );
    console.log(`[migrate] Updated ${backfill.changes} rows from Stationary -> At Warehouse.`);

    db.close();
    console.log('\n[migrate] Done. Delivery fields added.');
}

run().catch(err => {
    console.error('[migrate] ERROR:', err);
    process.exit(1);
});
