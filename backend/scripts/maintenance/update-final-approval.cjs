const fs = require("fs");
const file = "src/controllers/ordercontroller.js";
let content = fs.readFileSync(file, "utf8");

const replacement = `
        order.status = 'Sales Processing';
        order.employeeApproval = 'Approved';
        
        if (order.workflow && Array.isArray(order.workflow)) {
            const activeStageIndex = order.workflow.findIndex(w => w.status === 'In Progress');
            if (activeStageIndex !== -1) {
                order.workflow[activeStageIndex].status = 'Completed';
                order.workflow[activeStageIndex].remarks = 'Employee Final Approval Complete';
                order.workflow[activeStageIndex].updatedBy = req.user.name;
                order.workflow[activeStageIndex].completedAt = new Date();
                
                // Advance to Sales Processing
                if (activeStageIndex + 1 < order.workflow.length) {
                    order.workflow[activeStageIndex + 1].status = 'In Progress';
                }
                
                order.changed('workflow', true);
            }
        }
        
        await order.save();
`;

const searchString = `order.status = 'Sales Processing';
        order.employeeApproval = 'Approved';
        await order.save();`;

content = content.replace(searchString, replacement);

fs.writeFileSync(file, content);
console.log("Updated employeeFinalApproval");
