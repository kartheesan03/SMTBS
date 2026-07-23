const mongoose = require("mongoose");
const Order = require("./src/models/Order");
require('dotenv').config();

// Need to connect DB? The models might connect automatically if imported. 
// Wait, `require('./src/models/Order')` uses Sequelize and mongoose-bridge, but we need to ensure the DB connection is established.
// Let's just require the server setup or use the raw models.

async function fixOrders() {
    try {
        const orders = await Order.find({ status: "Inventory Verified" });
        let updatedCount = 0;
        
        for (const order of orders) {
            const workflow = order.workflow || [];
            const activeStageIndex = workflow.findIndex(w => w.status === "In Progress");
            
            if (activeStageIndex !== -1) {
                workflow[activeStageIndex].status = "Completed";
                workflow[activeStageIndex].remarks = "Inventory Physical Check Complete (auto-fixed)";
                workflow[activeStageIndex].completedAt = new Date();
                
                if (activeStageIndex + 1 < workflow.length) {
                    workflow[activeStageIndex + 1].status = "In Progress";
                }
                
                order.changed("workflow", true);
                await order.save();
                updatedCount++;
                console.log(`Fixed order ${order.orderNumber}`);
            }
        }
        console.log(`Fixed ${updatedCount} orders`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

fixOrders();
