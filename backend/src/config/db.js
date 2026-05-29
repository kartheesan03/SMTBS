const mysql = require('mysql2/promise');
const sequelize = require('./sequelize');
const setupAssociations = require('../models/associations');

const ensureDatabaseExists = async () => {
    const host = process.env.MYSQL_HOST || 'localhost';
    const port = process.env.MYSQL_PORT || 3306;
    const username = process.env.MYSQL_USER || 'root';
    const password = process.env.MYSQL_PASSWORD || '';
    const database = process.env.MYSQL_DATABASE || 'smtbs_db';

    const connection = await mysql.createConnection({
        host,
        port,
        user: username,
        password
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await connection.end();
};

const connectDB = async () => {
    try {
        // Ensure database exists before Sequelize connection pool connects
        await ensureDatabaseExists();
        console.log('Target MySQL database verified/created.');

        // Authenticate database connection
        await sequelize.authenticate();
        console.log('MySQL Connection established successfully via Sequelize.');

        // Establish structural associations between MySQL tables
        setupAssociations();

        // Synchronize Sequelize schemas with MySQL database
        await sequelize.sync({ alter: true });
        console.log('MySQL Database tables synchronized and updated.');
    } catch (error) {
        console.error('MySQL Connection / Synchronization failed:');
        console.error(`Message: ${error.message}`);
        console.error(`Stack: ${error.stack}`);
        process.exit(1);
    }
};

module.exports = connectDB;
