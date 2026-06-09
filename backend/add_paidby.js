const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({ dialect: 'sqlite', storage: './database.sqlite' });
sequelize.query("ALTER TABLE Salary ADD COLUMN paidBy INTEGER").then(r => console.log('Done')).catch(console.error);
