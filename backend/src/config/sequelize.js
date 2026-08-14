const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

// Use PostgreSQL if DATABASE_URL is set (e.g., Railway PostgreSQL)
if (process.env.MYSQL_URL) {
    sequelize = new Sequelize(process.env.MYSQL_URL, {
        dialect: 'mysql',
        logging: false,
        pool: { acquire: 5000 },
        dialectOptions: { connectTimeout: 5000 },
        define: {
            timestamps: true,
            freezeTableName: true
        }
    });
} else if (process.env.MYSQL_HOST && process.env.MYSQL_HOST !== 'localhost' && process.env.MYSQL_HOST !== 'your_remote_mysql_host_ip_or_url') {
    sequelize = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT || 3306,
        dialect: 'mysql',
        logging: false,
        pool: { acquire: 5000 },
        dialectOptions: { connectTimeout: 5000 },
        define: {
            timestamps: true,
            freezeTableName: true
        }
    });
} else if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
        pool: { acquire: 5000 },
        dialectOptions: {
            statement_timeout: 5000,
            query_timeout: 5000,
            connectionTimeoutMillis: 5000,
            ssl: process.env.NODE_ENV === 'production' ? {
                require: true,
                rejectUnauthorized: false
            } : false
        },
        define: {
            timestamps: true,
            freezeTableName: true
        }
    });
} else {
    try {
        sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: path.join(__dirname, '../../database.sqlite'),
            logging: false,
            pool: { acquire: 5000 },
            define: {
                timestamps: true,
                freezeTableName: true
            }
        });
    } catch (sqliteErr) {
        console.error('FATAL ERROR: Failed to initialize SQLite.', sqliteErr.message);
        console.error('If you are deploying to Railway, please provision a PostgreSQL or MySQL database and set DATABASE_URL or MYSQL_URL.');
        // Create a dummy sequelize instance so the app doesn't crash on require
        sequelize = {
            define: () => ({}),
            models: {},
            getDialect: () => 'sqlite',
            authenticate: async () => { throw new Error('SQLite binary failed to load.'); },
            sync: async () => {},
            query: async () => []
        };
    }
}

module.exports = sequelize;