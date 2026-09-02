require('dotenv').config({path:'.env'});
const sequelize = require('./src/config/sequelize');
sequelize.query('SELECT orderType, MONTH(orderDate) as month, SUM(totalAmount) as total FROM `Order` GROUP BY orderType, MONTH(orderDate)').then(res => {
  console.log(res[0]);
  process.exit(0);
});
