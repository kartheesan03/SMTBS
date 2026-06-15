const { makeBridgedModel } = require('./src/config/mongoose-bridge');
const sequelize = require('./src/config/sequelize');
const OrderSequelize = require('./src/models/Order').OrderSequelize;
const Order = require('./src/models/Order');

async function test() {
    try {
        await sequelize.authenticate();
        console.log("Connected to DB");
        const orders = await Order.find({});
        console.log("Orders:", orders);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit(0);
    }
}
test();
