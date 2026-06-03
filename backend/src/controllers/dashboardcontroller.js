const Material = require('../models/Material');
const Employee = require('../models/Employee');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Salary = require('../models/Salary');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');

const getDashboardStats = async (req, res) => {
    try {
        const role = req.user.role;
        
        let stats = {};
        try {
            const [totalMaterials, totalEmployees, totalOrders, totalCustomers, totalLeads] = await Promise.all([
                Material.countDocuments(),
                Employee.countDocuments(),
                Order.countDocuments(),
                Customer.countDocuments(),
                Lead.countDocuments()
            ]);
            stats = { totalMaterials, totalEmployees, totalOrders, totalCustomers, totalLeads };
        } catch (e) { console.error('Count Stats Error:', e); }

        let revenue = 0;
        try {
            const revenueResult = await Order.aggregate([
                { $match: { status: { $ne: 'Cancelled' }, totalAmount: { $exists: true } } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ]);
            revenue = (revenueResult && revenueResult.length > 0) ? revenueResult[0].total : 0;
        } catch (e) { console.error('Revenue Aggregation Error:', e); }

        let lowStockMaterials = [];
        let totalStockQuantity = 0;
        let inTransitCount = 0; // Hardcoded fake removed, start at 0
        try {
            const allMaterials = await Material.find();
            allMaterials.forEach(m => {
                totalStockQuantity += (m.quantity || 0);
                if (m.quantity <= (m.lowStockThreshold || 0)) {
                    lowStockMaterials.push(m);
                }
            });
            // Try to find in transit from orders or just 0
            inTransitCount = 0;
        } catch (e) { console.error('Material Find Error:', e); }

        let categoryData = [];
        try {
            categoryData = await Material.aggregate([
                { $group: { _id: "$category", value: { $sum: 1 } } },
                { $project: { name: { $ifNull: ["$_id", "Uncategorized"] }, value: 1 } }
            ]);
        } catch (e) { console.error('Category Aggregation Error:', e); }

        let monthlyStats = [];
        try {
            const monthlyStatsRaw = await Order.aggregate([
                { $match: { createdAt: { $exists: true } } },
                {
                    $group: {
                        _id: { $month: "$createdAt" },
                        sales: { $sum: 1 },
                        revenue: { $sum: "$totalAmount" }
                    }
                },
                { $sort: { "_id": 1 } },
                {
                    $project: {
                        name: {
                            $arrayElemAt: [
                                ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                                { $ifNull: ["$_id", 0] }
                            ]
                        },
                        sales: 1,
                        revenue: 1
                    }
                }
            ]);
            monthlyStats = monthlyStatsRaw || [];
        } catch (e) { console.error('Monthly Stats Aggregation Error:', e); }

        let recentOrders = [];
        try {
            recentOrders = await Order.find()
                .populate('customer', 'name')
                .sort({ createdAt: -1 })
                .limit(5);
        } catch (e) { console.error('Recent Orders Find Error:', e); }

        let pendingSalaries = [];
        try {
            pendingSalaries = await Salary.find({ status: 'Awaiting Approval' })
                .populate({
                    path: 'employee',
                    populate: { path: 'userId', select: 'name' }
                })
                .sort({ createdAt: -1 });
        } catch (e) { console.error('Pending Salaries Find Error:', e); }

        let data = {
            stats: { 
                ...stats,
                revenue,
                pendingOrders: await Order.countDocuments({ status: 'Awaiting Approval' }),
                pendingSalaries: await Salary.countDocuments({ status: 'Awaiting Approval' }),
                pendingCustomers: await Customer.countDocuments({ status: 'Pending Review' })
            },
            materialStats: {
                totalMaterialTypes: stats.totalMaterials || 0,
                totalStockQuantity: totalStockQuantity,
                lowStockCount: lowStockMaterials.length,
                inTransitCount: inTransitCount
            },
            charts: { monthlyStats, categoryData: categoryData || [] },
            tables: { 
                lowStock: lowStockMaterials, 
                recentOrders: recentOrders || [],
                pendingSalaries: pendingSalaries || [],
                leadList: role === 'Sales' ? await Lead.find().sort({ createdAt: -1 }).limit(5) : []
            }
        };

        if (role === 'HR' || role === 'Admin') {
            try {
                const todayStart = new Date();
                todayStart.setHours(0,0,0,0);
                const todayEnd = new Date();
                todayEnd.setHours(23,59,59,999);

                const activeEmployeesCount = await Employee.countDocuments({
                    $or: [
                        { status: 'Active' },
                        { status: { $exists: false } },
                        { active: true },
                        { active: { $exists: false } }
                    ]
                });

                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                const newJoinersCount = await Employee.countDocuments({
                    joinDate: { $gte: thirtyDaysAgo }
                });

                const totalEmps = activeEmployeesCount || 1;
                const deptStats = await Employee.aggregate([
                    { $match: { $or: [{ status: 'Active' }, { status: { $exists: false } }, { active: true }, { active: { $exists: false } }] } },
                    { $group: { _id: "$department", value: { $sum: 1 } } }
                ]);
                
                const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#7c3aed', '#0d9488'];
                const employeeDistribution = deptStats.map((d, index) => ({
                    name: d._id || 'Other',
                    value: d.value,
                    percentage: `${((d.value / totalEmps) * 100).toFixed(1)}%`,
                    color: COLORS[index % COLORS.length]
                }));

                const recentEmployees = await Employee.find()
                    .sort({ createdAt: -1 })
                    .limit(4);

                const recentEmployeesFormatted = recentEmployees.map(emp => ({
                    name: `${emp.firstName} ${emp.lastName || ''}`.trim(),
                    role: emp.designation || 'Staff',
                    avatar: `${emp.firstName[0] || ''}${emp.lastName ? emp.lastName[0] : ''}`.toUpperCase()
                }));

                const attendanceHistory = [];
                for (let i = 4; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    d.setHours(0,0,0,0);
                    
                    const dEnd = new Date(d);
                    dEnd.setHours(23,59,59,999);

                    const count = await Attendance.countDocuments({
                        date: { $gte: d, $lte: dEnd },
                        status: { $in: ['Present', 'Late'] }
                    });
                    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                    attendanceHistory.push({ name: dayName, employees: count });
                }

                data.hrStats = {
                    totalEmployees: activeEmployeesCount,
                    presentToday: 0,
                    onLeave: 0,
                    pending: 0,
                    absentToday: 0,
                    newJoiners: newJoinersCount,
                    employeeDistribution,
                    recentEmployees: recentEmployeesFormatted,
                    attendanceHistory
                };
            } catch (err) {
                console.error('HR Dashboard Stats Error:', err);
                data.hrStats = { totalEmployees: stats.totalEmployees, presentToday: 0, onLeave: 0, newJoiners: 0, employeeDistribution: [], recentEmployees: [], attendanceHistory: [] };
            }
        } else if (role === 'Sales') {
            try {
                const pipelineData = await Lead.aggregate([
                    { $group: { _id: "$status", value: { $sum: 1 } } },
                    { $project: { name: "$_id", value: 1 } }
                ]);
                data.salesStats = {
                    totalLeads: stats.totalLeads,
                    convertedLeads: await Lead.countDocuments({ status: 'Converted to Vendor' }),
                    pipelineData: pipelineData || []
                };
            } catch (e) { console.error('Sales Pipeline Aggregation Error:', e); }
        }

        res.json(data);
    } catch (error) {
        console.error('Final Dashboard Stats Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats };
