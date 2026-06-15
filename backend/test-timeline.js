const sequelize = require('./src/config/sequelize');
const Order = require('./src/models/Order');

async function test() {
    try {
        await sequelize.authenticate();
        console.log("Connected to DB");
        
        let order = await Order.findById(18);
        order.trackingTimeline = [{ status: "Test", date: new Date().toISOString() }];
        await order.save();
        
        order = await Order.findById(18);
        console.log("Timeline type:", typeof order.trackingTimeline);
        console.log("Timeline array?", Array.isArray(order.trackingTimeline));
        console.log("Timeline:", order.trackingTimeline);
        
    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit(0);
    }
}
test();
