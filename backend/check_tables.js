const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({ dialect: 'sqlite', storage: './database.sqlite' });
sequelize.query("SELECT name FROM sqlite_master WHERE type='table'").then(r => console.log(r[0])).catch(console.error);
