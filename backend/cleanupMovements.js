const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'src', 'database', 'smtbms.sqlite')
});

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Connected to sqlite');
    const [results] = await sequelize.query("DELETE FROM MaterialMovements WHERE materialId NOT IN (SELECT id FROM Materials)");
    console.log('Deleted orphaned movements:', results);
  } catch (error) {
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

run();
