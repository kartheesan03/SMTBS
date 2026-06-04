const sequelize = require('./src/config/sequelize');
const Lead = require('./src/models/Lead');
sequelize.authenticate()
  .then(() => Lead.aggregate([
    { $match: { status: { $in: ['Initial Contact', 'Won'] } } },
    { $group: { _id: '$status', value: { $sum: 1 } } }
  ]))
  .then(c => { console.log('AGG:', c); process.exit(); })
  .catch(e => { console.error(e); process.exit(1); });
