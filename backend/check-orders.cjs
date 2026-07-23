const mongoose = require("mongoose");
const Order = require("./src/models/Order");
require("dotenv").config();

async function checkOrders() {
    try {
        const orders = await Order.find();
        for (const order of orders) {
            console.log(`Order ${order.orderNumber}: status = ${order.status}`);
            const workflow = order.workflow || [];
            const activeStageIndex = workflow.findIndex(w => w.status === "In Progress");
            if (activeStageIndex !== -1) {
                console.log(`  -> active stage: ${workflow[activeStageIndex].stage}`);
            }
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkOrders();
