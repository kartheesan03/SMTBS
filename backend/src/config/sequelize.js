const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

if (process.env.NODE_ENV === 'production') {
    sequelize = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
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
        logging: console.log,
        define: {
            timestamps: true,
            freezeTableName: true
        }
    });
}

module.exports = sequelize;