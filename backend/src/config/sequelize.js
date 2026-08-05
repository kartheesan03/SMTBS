const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

// Use MySQL only if MYSQL_URL is explicitly set (e.g. Railway managed MySQL)
if (process.env.MYSQL_URL) {
    sequelize = new Sequelize(process.env.MYSQL_URL, {
        dialect: 'mysql',
        logging: false,
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
        define: {
            timestamps: true,
            freezeTableName: true
        }
    });
} else {
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, '../../database.sqlite'),
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        define: {
            timestamps: true,
            freezeTableName: true
        }
    });
}

module.exports = sequelize;