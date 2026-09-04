const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const sequelize = require('./src/config/sequelize');
require('./src/models/OcrDocument'); // Ensure model is loaded

sequelize.sync({ alter: true })
  .then(() => console.log('Sync successful'))
  .catch(console.error)
  .finally(() => process.exit());
