const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function runMigration() {
    console.log('Starting MySQL migration...');

    // Need either MYSQL_URL or individual credentials
    if (!process.env.MYSQL_URL && !process.env.MYSQLHOST) {
        console.error('Error: MYSQL_URL or MYSQLHOST environment variable is missing.');
        process.exit(1);
    }

    let connection;
    try {
        if (process.env.MYSQL_URL) {
            console.log('Connecting using MYSQL_URL...');
            connection = await mysql.createConnection({
                uri: process.env.MYSQL_URL,
                multipleStatements: true
            });
        } else {
            console.log(`Connecting to ${process.env.MYSQLHOST}...`);
            connection = await mysql.createConnection({
                host: process.env.MYSQLHOST,
                port: process.env.MYSQLPORT || 3306,
                user: process.env.MYSQLUSER,
                password: process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD,
                database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE,
                multipleStatements: true
            });
        }
        
        console.log('✅ Connected to MySQL database!');
    } catch (err) {
        console.error('❌ Failed to connect to MySQL:', err.message);
        process.exit(1);
    }

    const sqlFile = path.join(__dirname, 'smtbs_mysql_export.sql');
    if (!fs.existsSync(sqlFile)) {
        console.error(`❌ Migration file not found: ${sqlFile}`);
        process.exit(1);
    }

    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    console.log(`Reading SQL file (${(sqlContent.length / 1024).toFixed(1)} KB)...`);

    try {
        console.log('Executing SQL dump...');
        await connection.query(sqlContent);
        console.log('✅ Migration executed successfully!');
    } catch (err) {
        console.error('❌ Migration failed during execution:', err.message);
        // Don't exit 1 yet, we want to close connection
    } finally {
        await connection.end();
    }
}

runMigration();
