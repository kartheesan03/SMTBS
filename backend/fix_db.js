const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({ dialect: 'sqlite', storage: 'database.sqlite' });
async function run() {
    try {
        await sequelize.query('ALTER TABLE "Order" ADD COLUMN approvalStatus VARCHAR(255) DEFAULT \'Pending\'');
        await sequelize.query('ALTER TABLE "Order" ADD COLUMN deliveryStatus VARCHAR(255) DEFAULT \'Pending\'');
        await sequelize.query('ALTER TABLE "Order" ADD COLUMN invoiceGenerated TINYINT(1) DEFAULT 0');
        await sequelize.query('ALTER TABLE "Order" ADD COLUMN invoiceFile VARCHAR(255)');
        await sequelize.query('ALTER TABLE "Material" ADD COLUMN reservedQuantity INTEGER DEFAULT 0');
        console.log('Columns added successfully');
    } catch(e) {
        console.error(e.message);
    }
}
run();
