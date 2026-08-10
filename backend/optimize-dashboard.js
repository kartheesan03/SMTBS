const fs = require('fs');

let content = fs.readFileSync('src/controllers/dashboardcontroller.js', 'utf8');

// 1. Insert the parallel fetch at the top of getDashboardStats
const topParallelFetch = `
        const [
            _allMats, _allEmps, _allOrds, _allCusts, _allVends,
            _allLeaves, _allSals, _allAtts, _allTasks, _allLeads, _allQuotes,
            _allNotifs, _allAudits
        ] = await Promise.all([
            Material.find({}), Employee.find({}), Order.find({}), Customer.find({}), Vendor.find({}),
            Leave.find({}), Salary.find({}), Attendance.find({}), require('../models/Task').find({}).catch(()=>[]),
            require('../models/Lead').find({}).catch(()=>[]), require('../models/Quotation').find({}).catch(()=>[]),
            require('../models/Notification').find({}).catch(()=>[]), require('../models/AuditLog').find({}).catch(()=>[])
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

content = content.replace('const getDashboardStats = async (req, res) => {\n    try {\n        const role = req.user.role;', 
    'const getDashboardStats = async (req, res) => {\n    try {\n        const role = req.user.role;\n' + topParallelFetch);


// 2. Replace countDocuments
content = content.replace(/await\s+Employee\.countDocuments\(\s*\{\s*\}\s*\)/g, '_allEmps.length');
content = content.replace(/await\s+Order\.countDocuments\(\s*\{\s*\}\s*\)/g, '_allOrds.length');
content = content.replace(/await\s+Customer\.countDocuments\(\s*\{\s*\}\s*\)/g, '_allCusts.length');
content = content.replace(/await\s+Vendor\.countDocuments\(\s*\{\s*\}\s*\)/g, '_allVends.length');

content = content.replace(/await\s+Customer\.countDocuments\(\{\s*status:\s*'Active'\s*\}\)/g, "(_allCusts.filter(c => c.status === 'Active').length)");
content = content.replace(/await\s+Order\.countDocuments\(\{\s*orderType:\s*'sales'\s*\}\)/g, "(_allOrds.filter(o => o.orderType === 'sales').length)");
content = content.replace(/await\s+Order\.countDocuments\(\{\s*orderType:\s*'purchase'\s*\}\)/g, "(_allOrds.filter(o => o.orderType === 'purchase').length)");
content = content.replace(/await\s+Order\.countDocuments\(\{\s*status:\s*\{\s*\$nin:\s*\[([^\]]+)\]\s*\}\s*\}\)/g, "(_allOrds.filter(o => ![$1].includes(o.status)).length)");
content = content.replace(/await\s+Order\.countDocuments\(\{\s*status:\s*'Awaiting Approval'\s*\}\)/g, "(_allOrds.filter(o => o.status === 'Awaiting Approval').length)");
content = content.replace(/await\s+Salary\.countDocuments\(\{\s*status:\s*'Awaiting Approval'\s*\}\)/g, "(_allSals.filter(s => s.status === 'Awaiting Approval').length)");
content = content.replace(/await\s+Customer\.countDocuments\(\{\s*status:\s*'Pending Review'\s*\}\)/g, "(_allCusts.filter(c => c.status === 'Pending Review').length)");
content = content.replace(/await\s+Order\.countDocuments\(\{\s*status:\s*\{\s*\$in:\s*\[([^\]]+)\]\s*\}\s*\}\)/g, "(_allOrds.filter(o => [$1].includes(o.status)).length)");
content = content.replace(/await\s+Leave\.countDocuments\(\{\s*status:\s*'Pending'\s*\}\)/g, "(_allLeaves.filter(l => l.status === 'Pending').length)");
content = content.replace(/await\s+Leave\.countDocuments\(\{\s*employeeId:\s*empRecord\._id,\s*status:\s*'Pending'\s*\}\)/g, "(_allLeaves.filter(l => l.status === 'Pending' && String(l.employeeId) === String(empRecord._id)).length)");

// 3. Replace .find
content = content.replace(/await\s+Material\.find\(\{\}\)/g, '_allMats');
content = content.replace(/await\s+Material\.find\(\)/g, '_allMats');
content = content.replace(/await\s+Order\.find\(\{\s*orderType:\s*'purchase',\s*status:\s*\{\s*\$in:\s*\[([^\]]+)\]\s*\}\s*\}\)/g, "(_allOrds.filter(o => o.orderType === 'purchase' && [$1].includes(o.status)))");
content = content.replace(/await\s+Order\.find\(\{\s*orderType:\s*'sales',\s*status:\s*\{\s*\$ne:\s*'Cancelled'\s*\}\s*\}\)/g, "(_allOrds.filter(o => o.orderType === 'sales' && o.status !== 'Cancelled'))");
content = content.replace(/await\s+Order\.find\(\{\s*orderType:\s*'purchase',\s*status:\s*\{\s*\$ne:\s*'Cancelled'\s*\}\s*\}\)/g, "(_allOrds.filter(o => o.orderType === 'purchase' && o.status !== 'Cancelled'))");
content = content.replace(/await\s+Order\.find\(\{\s*orderType:\s*'sales'\s*\}\)/g, "(_allOrds.filter(o => o.orderType === 'sales'))");
content = content.replace(/await\s+Salary\.find\(\{\s*status:\s*'Awaiting Approval'\s*\}\)\s*\.sort\(\{\s*createdAt:\s*-1\s*\}\)/g, "(_allSals.filter(s => s.status === 'Awaiting Approval').sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)))");
content = content.replace(/await\s+Vendor\.find\(\{\}\)/g, '_allVends');
content = content.replace(/await\s+Employee\.find\(\{\}\)/g, '_allEmps');
content = content.replace(/await\s+Employee\.find\(\)/g, '_allEmps');

// 4. Fix aggregate issues temporarily by leaving them or caching them. 
// We leave Order.aggregate as it is because it is fast enough and only runs 3 times.

// 5. Replace recent limit queries
content = content.replace(/await\s+Order\.find\(\)\s*\.sort\(\{\s*createdAt:\s*-1\s*\}\)\s*\.limit\(5\)/g, "([..._allOrds].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0,5))");
content = content.replace(/await\s+Notification\.find\(notifQuery\)\.sort\(\{\s*createdAt:\s*-1\s*\}\)\.limit\(5\)/g, "(_filter(_allNotifs, notifQuery).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0,5))");
content = content.replace(/await\s+AuditLog\.find\(\)\.sort\(\{\s*createdAt:\s*-1\s*\}\)\.limit\(10\)\.catch\(\(\)\s*=>\s*\[\]\)/g, "([..._allAudits].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0,10))");

// 6. Write it back
fs.writeFileSync('src/controllers/dashboardcontroller.js', content);
console.log('Optimized dashboardcontroller.js successfully!');
