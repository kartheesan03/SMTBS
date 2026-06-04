const sequelize = require('./src/config/sequelize');
const Lead = require('./src/models/Lead');
sequelize.authenticate()
  .then(() => Lead.countDocuments({ status: { $in: ['Initial Contact', 'Won'] } }))
  .then(c => { console.log('COUNT:', c); process.exit(); })
  .catch(e => { console.error(e); process.exit(1); });
