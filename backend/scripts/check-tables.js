require('dotenv').config();
const seq = require('../src/config/sequelize');

(async () => {
  try {
    await seq.authenticate();
    const dialect = seq.getDialect();
    let rows;
    if (dialect === 'sqlite') {
      [rows] = await seq.query("SELECT name FROM sqlite_master WHERE type='table';");
      console.log('SQLite tables:', rows.map(r => r.name));
    } else {
      [rows] = await seq.query('SHOW TABLES;');
      const key = Object.keys(rows[0] || {})[0];
      console.log('MySQL tables:', rows.map(r => r[key]));
    }
  } catch (e) {
    console.error(e.message);
  } finally {
    process.exit(0);
  }
})();
