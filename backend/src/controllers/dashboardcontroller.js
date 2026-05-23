const Material = require('../models/Material');
const Employee = require('../models/Employee');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');

const Salary = require('../models/Salary');

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
        try {
            lowStockMaterials = await Material.find({
                $expr: { $lte: ["$quantity", "$lowStockThreshold"] }
            });
        } catch (e) { console.error('Low Stock Find Error:', e); }

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
                            $arrayAt: [
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
            charts: { monthlyStats, categoryData: categoryData || [] },
            tables: { 
                lowStock: lowStockMaterials, 
                recentOrders: recentOrders || [],
                pendingSalaries: pendingSalaries || [],
                leadList: role === 'Sales' ? await Lead.find().sort({ createdAt: -1 }).limit(5) : []
            }
        };

        if (role === 'HR') {
            data.hrStats = { totalEmployees: stats.totalEmployees, presentToday: 0, onLeave: 0 };
        } else if (role === 'Sales') {
            try {
                const pipelineData = await Lead.aggregate([
                    { $group: { _id: "$status", value: { $sum: 1 } } },
                    { $project: { name: "$_id", value: 1 } }
                ]);
                data.salesStats = {
                    totalLeads: stats.totalLeads,
                    convertedLeads: await Lead.countDocuments({ status: 'Converted' }),
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
