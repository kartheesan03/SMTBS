const { Sequelize } = require('sequelize');
const sequelize = require('./src/config/sequelize');
const User = require('./src/models/User');
require('./src/models/associations')();

async function check() {
  await sequelize.authenticate();
  try {
      const followedIds = [];
      const users = await User.sequelizeModel.findAll({
          where: {
              id: {
                  [Sequelize.Op.notIn]: followedIds
              }
          },
          limit: 5,
          attributes: ['id', 'name']
      });
      console.log('Success', users);
  } catch (e) {
      console.error('Error!', e);
  }
  process.exit(0);
}
check();
