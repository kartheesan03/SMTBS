/**
 * MySQL setup script
 * Creates the smtbms database if it doesn't exist and tests the connection.
 * Run: node setup_mysql.js
 * 
 * Make sure DB_PASSWORD is set in .env before running.
 */
const mysql2 = require('mysql2/promise');
require('dotenv').config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT) || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'smtbms';

async function main() {
    console.log(`\nConnecting to MySQL at ${DB_HOST}:${DB_PORT} as ${DB_USER}...`);

    let conn;
    try {
        // Connect without a specific database first, so we can create it if needed
        conn = await mysql2.createConnection({
            host: DB_HOST,
            port: DB_PORT,
            user: DB_USER,
            password: DB_PASSWORD,
            connectTimeout: 10000,
        });
        console.log('✓ MySQL connection successful.');

        await conn.execute(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
        console.log(`✓ Database '${DB_NAME}' created (or already exists).`);

        await conn.execute(`USE \`${DB_NAME}\`;`);
        const [tables] = await conn.execute('SHOW TABLES;');
        console.log(`✓ Database '${DB_NAME}' is accessible. Current tables: ${tables.length}`);
        if (tables.length > 0) {
            tables.forEach(t => console.log('   -', Object.values(t)[0]));
        } else {
            console.log('   (No tables yet — will be created on first server start)');
        }

        console.log('\n✓ MySQL setup complete! You can now run: npm run dev\n');
    } catch (err) {
        console.error('\n✗ MySQL connection FAILED:');
        console.error('  Error:', err.message);
        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('\n  → Wrong DB_USER or DB_PASSWORD in your .env file.');
            console.error('    Please update DB_PASSWORD=YOUR_MYSQL_PASSWORD in backend/.env');
        } else if (err.code === 'ECONNREFUSED') {
            console.error('\n  → MySQL is not running or is not accessible at ' + DB_HOST + ':' + DB_PORT);
            console.error('    Try: Start the MySQL80 service from Windows Services.');
        }
        process.exit(1);
    } finally {
        if (conn) await conn.end();
    }
}

main();
