const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({ dialect: 'sqlite', storage: 'database.sqlite' });
async function run() {
    try {
        await sequelize.query('ALTER TABLE "Order" ADD COLUMN approvedById INTEGER');
        await sequelize.query('ALTER TABLE "Order" ADD COLUMN approvedDate DATETIME');
        await sequelize.query('ALTER TABLE "Order" ADD COLUMN deliveryDate DATETIME');
        console.log('Columns added successfully');
    } catch(e) {
        console.error(e.message);
    }
}
run();
