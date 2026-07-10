/**
 * migrate-material-location.js
 *
 * Adds location, warehouse, shelf, gpsStatus, locationUpdatedAt columns
 * to the Materials table (SQLite). Safe to run multiple times (idempotent).
 *
 * Usage: node backend/scripts/migrate-material-location.js
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

    // Enable WAL mode for safety
    await runQuery(db, 'PRAGMA journal_mode=WAL');

    const table = 'Material';

    // Get existing columns
    const cols = await allQuery(db, `PRAGMA table_info(${table})`);
    const existingColumns = new Set(cols.map(c => c.name));
    console.log(`[migrate] Existing columns: ${[...existingColumns].join(', ')}`);

    const columnsToAdd = [
        { name: 'warehouse',         sql: `ALTER TABLE ${table} ADD COLUMN warehouse TEXT DEFAULT NULL` },
        { name: 'shelf',             sql: `ALTER TABLE ${table} ADD COLUMN shelf TEXT DEFAULT NULL` },
        { name: 'location',          sql: `ALTER TABLE ${table} ADD COLUMN location TEXT DEFAULT NULL` },
        { name: 'gpsStatus',         sql: `ALTER TABLE ${table} ADD COLUMN gpsStatus TEXT DEFAULT 'Stationary'` },
        { name: 'locationUpdatedAt', sql: `ALTER TABLE ${table} ADD COLUMN locationUpdatedAt DATETIME DEFAULT NULL` },
    ];

    for (const col of columnsToAdd) {
        if (!existingColumns.has(col.name)) {
            console.log(`[migrate] Adding column: ${col.name}`);
            await runQuery(db, col.sql);
        } else {
            console.log(`[migrate] Column already exists, skipping: ${col.name}`);
        }
    }

    // Back-fill: set warehouse='Warehouse A', location='Warehouse A', gpsStatus='Stationary'
    // only for rows where warehouse is still NULL (i.e. pre-migration rows).
    const backfill = await runQuery(db,
        `UPDATE ${table}
         SET warehouse = 'Warehouse A',
             location  = 'Warehouse A',
             gpsStatus = 'Stationary'
         WHERE warehouse IS NULL`
    );
    console.log(`[migrate] Back-filled ${backfill.changes} rows with default location/gpsStatus.`);

    // Show summary
    const rows = await allQuery(db, `SELECT id, name, sku, warehouse, shelf, location, gpsStatus FROM ${table}`);
    console.log(`\n[migrate] Materials table (${rows.length} rows):`);
    rows.forEach(r => {
        console.log(`  [${r.id}] ${r.sku || 'N/A'} — ${r.name} | location: "${r.location}" | gpsStatus: "${r.gpsStatus}"`);
    });

    db.close();
    console.log('\n[migrate] Done. All columns added and data back-filled successfully.');
}

run().catch(err => {
    console.error('[migrate] ERROR:', err);
    process.exit(1);
});
