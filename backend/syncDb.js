const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const sequelize = require('./src/config/sequelize');
require('./src/models/associations')(); // Ensure all models are loaded and associated

sequelize.sync({ alter: true })
  .then(() => console.log('Sync successful'))
  .catch(console.error)
  .finally(() => process.exit());
