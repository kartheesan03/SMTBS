const fs = require('fs');
const file = 'src/controllers/ordercontroller.js';
let content = fs.readFileSync(file, 'utf8');

const replacement = `
        order.status = newStatus;

        // Advance workflow if all items are in stock
        if (newStatus === "Inventory Verified" && order.workflow && Array.isArray(order.workflow)) {
            const activeStageIndex = order.workflow.findIndex(w => w.status === "In Progress");
            if (activeStageIndex !== -1) {
                order.workflow[activeStageIndex].status = "Completed";
                order.workflow[activeStageIndex].remarks = "Inventory Physical Check Complete";
                order.workflow[activeStageIndex].updatedBy = req.user.name;
                order.workflow[activeStageIndex].completedAt = new Date();
                
                // Advance to next stage
                if (activeStageIndex + 1 < order.workflow.length) {
                    order.workflow[activeStageIndex + 1].status = "In Progress";
                }
                
                order.changed("workflow", true);
            }
        }
        
        await order.save();
`;

content = content.replace("order.status = newStatus;\n        await order.save();", replacement);

fs.writeFileSync(file, content);
console.log("Updated verifyInventory to advance workflow with changed(workflow, true).");
