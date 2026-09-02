require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'smtbms'
    });
    console.log("Connected successfully to MySQL!");
    await connection.end();
  } catch (err) {
    console.error("Connection failed:", err.message);
  }
}

testConnection();
