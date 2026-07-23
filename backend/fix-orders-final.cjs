const mongoose = require("mongoose");
const Order = require("./src/models/Order");
require("dotenv").config();

async function fixOrders() {
    try {
        const orders = await Order.find({ 
            status: { $in: ['Inventory Verified', 'Sales Processing'] } 
        });
        
        let updatedCount = 0;
        
        for (const order of orders) {
            const workflow = order.workflow || [];
            
            // If the order is "Sales Processing", the active stage should be "Sales Processing"
            // If the active stage is "Inventory Verified", we need to advance it.
            let activeStageIndex = workflow.findIndex(w => w.status === "In Progress");
            
            if (activeStageIndex !== -1) {
                const currentStageName = workflow[activeStageIndex].stage;
                
                if (order.status === "Sales Processing" && currentStageName === "Inventory Verified") {
                    workflow[activeStageIndex].status = "Completed";
                    workflow[activeStageIndex].remarks = "Employee Final Approval Complete (auto-fixed)";
                    workflow[activeStageIndex].completedAt = new Date();
                    
                    if (activeStageIndex + 1 < workflow.length) {
                        workflow[activeStageIndex + 1].status = "In Progress";
                    }
                    
                    order.changed("workflow", true);
                    await order.save();
                    updatedCount++;
                    console.log(`Fixed order ${order.orderNumber} to Sales Processing`);
                } else if (order.status === "Inventory Verified" && currentStageName === "Employee Verification") {
                    // For any orders still stuck in Employee Verification but overall status is Inventory Verified
                    workflow[activeStageIndex].status = "Completed";
                    workflow[activeStageIndex].remarks = "Inventory Physical Check Complete (auto-fixed)";
                    workflow[activeStageIndex].completedAt = new Date();
                    
                    if (activeStageIndex + 1 < workflow.length) {
                        workflow[activeStageIndex + 1].status = "In Progress";
                    }
                    
                    order.changed("workflow", true);
                    await order.save();
                    updatedCount++;
                    console.log(`Fixed order ${order.orderNumber} to Inventory Verified`);
                }
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
