require('dotenv').config();

const mysql = require('mysql2/promise');
const sequelize = require('./sequelize');
const setupAssociations = require('../models/associations');

const ensureDatabaseExists = async () => {
    const host = process.env.MYSQL_HOST || 'localhost';
    const port = Number(process.env.MYSQL_PORT) || 3306;
    const username = process.env.MYSQL_USER || 'root';
    const password = process.env.MYSQL_PASSWORD || '';
    const database = process.env.MYSQL_DATABASE || 'smtbs_db';

    if (!password) {
        throw new Error('MYSQL_PASSWORD is missing in backend/.env file');
    }

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
        await ensureDatabaseExists();
        console.log('Target MySQL database verified/created.');

        await sequelize.authenticate();
        console.log('MySQL Connection established successfully via Sequelize.');

        setupAssociations();

        await sequelize.sync({ alter: true });
        console.log('MySQL Database tables synchronized and updated.');

        return true;
    } catch (error) {
        console.error('\n******************************************************************************');
        console.error('  DATABASE CONNECTION / MIGRATION ERROR:');
        console.error(`  Message: ${error.message}`);
        console.error('\n  Please ensure:');
        console.error('  1. MySQL server is running.');
        console.error('  2. backend/.env has correct MYSQL_PASSWORD.');
        console.error('******************************************************************************\n');
        return false;
    }
};

module.exports = connectDB;