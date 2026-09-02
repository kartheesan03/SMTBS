const { Sequelize } = require('sequelize');

// ─── Validate required MySQL environment variables ────────────────────────────
const requiredVars = ['DB_HOST', 'DB_USER', 'DB_NAME'];
const missing = requiredVars.filter((v) => !process.env[v]);
if (missing.length > 0 && !process.env.MYSQL_URL) {
    console.error('\n================================================================================');
    console.error('  FATAL: Missing required MySQL environment variable(s):');
    missing.forEach((v) => console.error(`    - ${v}`));
    console.error('  Please set these in your .env file:');
    console.error('    DB_HOST=localhost');
    console.error('    DB_PORT=3306');
    console.error('    DB_USER=root');
    console.error('    DB_PASSWORD=your_password');
    console.error('    DB_NAME=smtbms');
    console.error('================================================================================\n');
    process.exit(1);
}

const poolConfig = {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000,
    evict: 30000,
};

const mysql2DialectOptions = {
    connectTimeout: 10000,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};

const sharedDefine = {
    timestamps: true,
    freezeTableName: true,
};

let sequelize;

if (process.env.MYSQL_URL) {
    // Railway / cloud MySQL URL format: mysql://user:pass@host:port/dbname
    sequelize = new Sequelize(process.env.MYSQL_URL, {
        dialect: 'mysql',
        logging: false,
        pool: poolConfig,
        dialectOptions: mysql2DialectOptions,
        define: sharedDefine,
    });
} else {
    // Local / explicit host+credentials config
    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD || '',
        {
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 3306,
            dialect: 'mysql',
            logging: false,
            pool: poolConfig,
            dialectOptions: mysql2DialectOptions,
            define: sharedDefine,
        }
    );
}

module.exports = sequelize;