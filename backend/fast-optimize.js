const fs = require('fs');
let content = fs.readFileSync('src/controllers/dashboardcontroller.js', 'utf8');

// 1. We must undo the damage from previous optimize-dashboard.js if any, but since we didn't inject `_allMats` we just have `_allMats` scattered.
// Actually, it's easier to just inject the declaration of `_allMats` etc. at the VERY TOP of getDashboardStats!

// Let's find the position of `let stats = {};` and insert our block right before it.
const topParallelFetch = `
        const [
            _allMats, _allEmps, _allOrds, _allCusts, _allVends,
            _allLeaves, _allSals, _allAtts, _allTasks, _allLeads, _allQuotes,
            _allNotifs, _allAudits
        ] = await Promise.all([
            Material.find({}).lean().catch(()=>[]), Employee.find({}).lean().catch(()=>[]), Order.find({}).lean().catch(()=>[]), Customer.find({}).lean().catch(()=>[]), Vendor.find({}).lean().catch(()=>[]),
            Leave.find({}).lean().catch(()=>[]), Salary.find({}).lean().catch(()=>[]), Attendance.find({}).lean().catch(()=>[]), require('../models/Task').find({}).lean().catch(()=>[]),
            require('../models/Lead').find({}).lean().catch(()=>[]), require('../models/Quotation').find({}).lean().catch(()=>[]),
            require('../models/Notification').find({}).lean().catch(()=>[]), require('../models/AuditLog').find({}).lean().catch(()=>[])
        ]);

        const _filter = (arr, condition) => {
            if (!arr) return [];
            return arr.filter(item => {
                for (let key in condition) {
                    if (condition[key] && condition[key].$in) {
                        if (!condition[key].$in.includes(item[key])) return false;
                    } else if (condition[key] && condition[key].$nin) {
                        if (condition[key].$nin.includes(item[key])) return false;
                    } else if (condition[key] && condition[key].$ne) {
                        if (item[key] === condition[key].$ne) return false;
                    } else if (condition[key] && condition[key].$gte !== undefined) {
                        const val = new Date(item[key]);
                        if (condition[key].$gte && val < condition[key].$gte) return false;
                        if (condition[key].$lte && val > condition[key].$lte) return false;
                    } else {
                        if (item[key] !== condition[key]) return false;
                    }
                }
                return true;
            });
        };
`;

if (!content.includes('const [\\n            _allMats')) {
    content = content.replace(/let stats = \{\};/, topParallelFetch + '\\nlet stats = {};');
}

// 2. Aggressively replace all await Model.find and countDocuments
// We will use standard string replacement for exact matches that we know are in the file.
content = content.replace(/await Employee\.countDocuments\(\)/g, '(_allEmps?_allEmps.length:0)');
content = content.replace(/await Order\.countDocuments\(\)/g, '(_allOrds?_allOrds.length:0)');
content = content.replace(/await Customer\.countDocuments\(\)/g, '(_allCusts?_allCusts.length:0)');
content = content.replace(/await Customer\.countDocuments\(\{ status: "Active" \}\)/g, "(_filter(_allCusts, { status: 'Active' }).length)");
content = content.replace(/await Vendor\.countDocuments\(\)/g, '(_allVends?_allVends.length:0)');

content = content.replace(/await Order\.countDocuments\(\{ orderType: "sales" \}\)/g, "(_filter(_allOrds, { orderType: 'sales' }).length)");
content = content.replace(/await Order\.countDocuments\(\{[\s\n]*orderType: "purchase",[\s\n]*\}\)/g, "(_filter(_allOrds, { orderType: 'purchase' }).length)");
content = content.replace(/await Order\.countDocuments\(\{[\s\n]*status: \{[\s\n]*\$nin: \[[\s\n]*"Completed",[\s\n]*"Delivered",[\s\n]*"Workflow Completed",[\s\n]*"Invoice Generated",[\s\n]*"Cancelled",[\s\n]*\],[\s\n]*\},[\s\n]*\}\)/g, "(_filter(_allOrds, { status: { $nin: ['Completed', 'Delivered', 'Workflow Completed', 'Invoice Generated', 'Cancelled'] } }).length)");

content = content.replace(/await Order\.find\(\{[\s\n]*orderType: "purchase",[\s\n]*status: \{ \$in: \["Pending", "Awaiting Approval", "Approved"\] \},[\s\n]*\}\)/g, "(_filter(_allOrds, { orderType: 'purchase', status: { $in: ['Pending', 'Awaiting Approval', 'Approved'] } }))");
content = content.replace(/await Order\.find\(\{[\s\n]*orderType: "sales",[\s\n]*status: \{ \$ne: "Cancelled" \},[\s\n]*\}\)/g, "(_filter(_allOrds, { orderType: 'sales', status: { $ne: 'Cancelled' } }))");
content = content.replace(/await Order\.find\(\{[\s\n]*orderType: "purchase",[\s\n]*status: \{ \$ne: "Cancelled" \},[\s\n]*\}\)/g, "(_filter(_allOrds, { orderType: 'purchase', status: { $ne: 'Cancelled' } }))");

content = content.replace(/await Order\.countDocuments\(\{ status: "Awaiting Approval" \}\)/g, "(_filter(_allOrds, { status: 'Awaiting Approval' }).length)");
content = content.replace(/await Salary\.countDocuments\(\{ status: "Awaiting Approval" \}\)/g, "(_filter(_allSals, { status: 'Awaiting Approval' }).length)");
content = content.replace(/await Customer\.countDocuments\(\{ status: "Pending Review" \}\)/g, "(_filter(_allCusts, { status: 'Pending Review' }).length)");
content = content.replace(/await Order\.countDocuments\(\{ status: \{ \$in: \["Pending", "Processing"\] \} \}\)/g, "(_filter(_allOrds, { status: { $in: ['Pending', 'Processing'] } }).length)");
content = content.replace(/await Leave\.countDocuments\(\{ status: "Pending" \}\)/g, "(_filter(_allLeaves, { status: 'Pending' }).length)");

content = content.replace(/await Attendance\.find\(\{[\s\n]*date: \{ \$gte: fiveDaysAgo \},[\s\n]*\}\)/g, "(_filter(_allAtts, { date: { $gte: fiveDaysAgo } }))");
content = content.replace(/await Order\.find\(\{ orderType: "sales" \}\)/g, "(_filter(_allOrds, { orderType: 'sales' }))");

// HR and Sales loops
content = content.replace(/await Attendance\.countDocuments\(\{[\s\n]*date: \{ \$gte: d, \$lte: dEnd \},[\s\n]*status: \{ \$in: \["Present", "Late"\] \},[\s\n]*\}\)/g, "(_filter(_allAtts, { date: { $gte: d, $lte: dEnd }, status: { $in: ['Present', 'Late'] } }).length)");

content = content.replace(/await Employee\.countDocuments\(\)/g, "(_allEmps.length)");
content = content.replace(/await Leave\.countDocuments\(\{[\s\n]*employeeId: empRecord\._id,[\s\n]*status: "Pending",[\s\n]*\}\)/g, "(_filter(_allLeaves, { employeeId: empRecord._id, status: 'Pending' }).length)");

// Now, replace any raw find calls that were not covered
content = content.replace(/await Material\.find\(\)/g, "(_allMats)");
content = content.replace(/await Employee\.find\(\)/g, "(_allEmps)");
content = content.replace(/await Vendor\.find\(\{\}\)/g, "(_allVends)");
content = content.replace(/await Customer\.find\(\{\}\)/g, "(_allCusts)");

// Write it back
fs.writeFileSync('src/controllers/dashboardcontroller.js', content);
console.log('Optimized aggressively!');
