/**
 * export_to_mysql.js
 * Reads all data from the local SQLite database and writes a MySQL-compatible
 * SQL dump that can be imported into any hosted MySQL instance.
 * 
 * Run: node export_to_mysql.js
 * Output: smtbs_mysql_export.sql
 */

const path = require('path');
const fs   = require('fs');

// ── load environment ──────────────────────────────────────────────────────────
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Force SQLite regardless of env so we read local data
process.env.MYSQL_HOST = 'localhost'; // keeps sequelize.js picking SQLite branch

const { Sequelize, DataTypes, QueryTypes } = require('sequelize');

const sequelize = new Sequelize({
    dialect : 'sqlite',
    storage : path.join(__dirname, 'database.sqlite'),
    logging  : false,
});

const OUT_FILE = path.join(__dirname, '..', 'smtbs_mysql_export.sql');

// ── helpers ───────────────────────────────────────────────────────────────────
function escapeMysql(val, type) {
    if (val === null || val === undefined || val === '') return 'NULL';
    if (type && (type.toUpperCase().includes('DATETIME') || type.toUpperCase().includes('TIMESTAMP'))) {
        if (typeof val === 'string') {
            let d = val.replace(/ \+00:00$/, '');
            d = d.split('.')[0];
            return "'" + d + "'";
        }
    }
    if (typeof val === 'number')           return String(val);
    if (typeof val === 'boolean')          return val ? '1' : '0';

    const str = String(val);
    return "'" + str
        .replace(/\\/g, '\\\\')
        .replace(/'/g,  "\\'")
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\0/g, '\\0') + "'";
}

function sqliteTypeToMysql(type) {
    if (!type) return 'TEXT';
    const t = type.toUpperCase();
    if (t.includes('INTEGER') || t.includes('INT')) return 'INT';
    if (t.includes('REAL') || t.includes('FLOAT') || t.includes('DOUBLE')) return 'DOUBLE';
    if (t.includes('BLOB'))   return 'LONGBLOB';
    if (t.includes('BOOLEAN') || t === 'TINYINT(1)') return 'TINYINT(1)';
    if (t.includes('TEXT') || t.includes('VARCHAR') || t.includes('CHAR')) return 'TEXT';
    if (t.includes('DATETIME') || t.includes('TIMESTAMP')) return 'DATETIME';
    if (t.includes('DATE')) return 'DATE';
    if (t.includes('NUMERIC') || t.includes('DECIMAL')) return 'DECIMAL(15,4)';
    return 'TEXT';
}

async function main() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to local SQLite database');
    } catch (e) {
        console.error('❌ Cannot connect to SQLite:', e.message);
        process.exit(1);
    }

    // Get all user tables (skip sqlite internals)
    const tables = await sequelize.query(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
        { type: QueryTypes.SELECT }
    );

    const lines = [];
    lines.push('-- ============================================================');
    lines.push('-- SMTBS MySQL Export');
    lines.push(`-- Generated: ${new Date().toISOString()}`);
    lines.push('-- Source: local SQLite database');
    lines.push('-- ============================================================');
    lines.push('');
    lines.push('SET sql_mode = \\'\\';');
    lines.push('SET FOREIGN_KEY_CHECKS = 0;');
    lines.push("SET NAMES 'utf8mb4';");
    lines.push('SET CHARACTER SET utf8mb4;');
    lines.push('');

    for (const { name } of tables) {
        console.log(`  Exporting table: ${name}`);

        // --- Schema ---
        // Get column info from PRAGMA
        const cols = await sequelize.query(`PRAGMA table_info("${name}")`, { type: QueryTypes.SELECT });

        if (!cols || cols.length === 0) {
            console.log(`    (skipped – no columns)`);
            continue;
        }

        lines.push(`-- Table: ${name}`);
        lines.push(`DROP TABLE IF EXISTS \`${name}\`;`);
        lines.push(`CREATE TABLE \`${name}\` (`);

        const colDefs = cols.map((c, i) => {
            const mysqlType = sqliteTypeToMysql(c.type);
            let def = `  \`${c.name}\` ${mysqlType}`;
            if (c.notnull) def += ' NOT NULL';
            if (c.dflt_value !== null && c.dflt_value !== undefined) {
                // Skip complex defaults that MySQL won't understand
                const dv = String(c.dflt_value);
                if (!dv.includes('(') && !dv.includes("'now'")) {
                    def += ` DEFAULT ${dv}`;
                }
            }
            return def;
        });

        // Primary key
        const pkCols = cols.filter(c => c.pk > 0).sort((a, b) => a.pk - b.pk);
        if (pkCols.length > 0) {
            colDefs.push(`  PRIMARY KEY (${pkCols.map(c => `\`${c.name}\``).join(', ')})`);
        }

        lines.push(colDefs.join(',\n'));
        lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
        lines.push('');

        // --- Data ---
        let rows;
        try {
            rows = await sequelize.query(`SELECT * FROM "${name}"`, { type: QueryTypes.SELECT });
        } catch (e) {
            console.log(`    ⚠ Could not read rows: ${e.message}`);
            rows = [];
        }

        if (rows && rows.length > 0) {
            const colNames = cols.map(c => `\`${c.name}\``).join(', ');
            const BATCH = 200;
            for (let i = 0; i < rows.length; i += BATCH) {
                const batch = rows.slice(i, i + BATCH);
                const values = batch.map(row => {
                    const vals = cols.map(c => escapeMysql(row[c.name], c.type));
                    return `  (${vals.join(', ')})`;
                });
                lines.push(`INSERT INTO \`${name}\` (${colNames}) VALUES`);
                lines.push(values.join(',\n') + ';');
            }
            console.log(`    → ${rows.length} rows exported`);
        } else {
            console.log(`    → 0 rows`);
        }
        lines.push('');
    }

    lines.push('SET FOREIGN_KEY_CHECKS = 1;');
    lines.push('');
    lines.push('-- Export complete.');

    fs.writeFileSync(OUT_FILE, lines.join('\n'), 'utf8');
    console.log(`\n✅ Done! MySQL dump written to: ${OUT_FILE}`);
    console.log(`   File size: ${(fs.statSync(OUT_FILE).size / 1024).toFixed(1)} KB`);
    console.log('\nNext step: Import this file into your hosted MySQL database.');

    await sequelize.close();
}

main().catch(err => {
    console.error('Export failed:', err);
    process.exit(1);
});
