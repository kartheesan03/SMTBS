const { Sequelize } = require('sequelize');

const host = process.env.MYSQL_HOST || 'localhost';
const port = process.env.MYSQL_PORT || 3306;
const username = process.env.MYSQL_USER || 'root';
const password = process.env.MYSQL_PASSWORD || '';
const database = process.env.MYSQL_DATABASE || 'smtbs_db';

const sequelize = new Sequelize(database, username, password, {
    host,
    port,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    define: {
        timestamps: true,
        freezeTableName: true
    }
});

module.exports = sequelize;
