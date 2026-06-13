const Material = require('../models/Material');
const Employee = require('../models/Employee');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Vendor = require('../models/Vendor');
const Salary = require('../models/Salary');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');

const getDashboardStats = async (req, res) => {
    try {
        const role = req.user.role;
        
        let stats = {};
        try {
            const materials = await Material.find({});
            const activeMaterialsCount = materials.filter(m => m.isActive !== false).length;

            const [totalEmployees, totalOrders, totalCustomers, totalVendors] = await Promise.all([
                Employee.countDocuments(),
                Order.countDocuments(),
                Customer.countDocuments(),
                Vendor.countDocuments()
            ]);
            stats = { totalMaterials: activeMaterialsCount, totalEmployees, totalOrders, totalCustomers, totalVendors };
        } catch (e) { console.error('Count Stats Error:', e); }

        let revenue = 0;
        let purchaseCost = 0;
        try {
            const revenueResult = await Order.aggregate([
                { $match: { status: { $ne: 'Cancelled' }, orderType: 'sales', totalAmount: { $exists: true } } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ]);
            revenue = (revenueResult && revenueResult.length > 0) ? revenueResult[0].total : 0;

            const purchaseResult = await Order.aggregate([
                { $match: { status: { $ne: 'Cancelled' }, orderType: 'purchase', totalAmount: { $exists: true } } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ]);
            purchaseCost = (purchaseResult && purchaseResult.length > 0) ? purchaseResult[0].total : 0;
            
            const salesCount = await Order.countDocuments({ orderType: 'sales' });
            const purchaseCount = await Order.countDocuments({ orderType: 'purchase' });
            stats.totalSalesOrders = salesCount;
            stats.totalPurchaseOrders = purchaseCount;
        } catch (e) { console.error('Revenue Aggregation Error:', e); }

        let lowStockMaterials = [];
        let totalStockQuantity = 0;
        let inTransitCount = 0;
        try {
            const allMaterialsRaw = await Material.find();
            const allMaterials = allMaterialsRaw.filter(m => m.isActive !== false);
            allMaterials.forEach(m => {
                totalStockQuantity += (m.quantity || 0);
                if (m.quantity <= (m.lowStockThreshold || 0)) {
                    lowStockMaterials.push(m);
                }
            });
            
            // Calculate inTransitCount from Purchase Orders
            const purchaseOrders = await Order.find({ 
                type: 'Purchase', 
                status: { $in: ['Pending', 'Awaiting Approval', 'Approved'] } 
            });
            purchaseOrders.forEach(po => {
                if (po.items && po.items.length > 0) {
                    po.items.forEach(item => {
                        inTransitCount += (item.quantity || 0);
                    });
                }
            });
        } catch (e) { console.error('Material Find Error:', e); }

        let categoryData = [];
        try {
            const materialsList = await Material.find();
            const activeMats = materialsList.filter(m => m.isActive !== false);
            const catCounts = {};
            activeMats.forEach(m => {
                const cat = m.category || "Uncategorized";
                catCounts[cat] = (catCounts[cat] || 0) + 1;
            });
            categoryData = Object.keys(catCounts).map(cat => ({ name: cat, value: catCounts[cat] }));
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
                .populate('vendor', 'name')
                .sort({ createdAt: -1 })
                .limit(5);
        } catch (e) { console.error('Recent Orders Find Error:', e); }

        let pendingSalaries = [];
        try {
            pendingSalaries = await Salary.find({ status: 'Awaiting Approval' })
                .sort({ createdAt: -1 });
        } catch (e) { console.error('Pending Salaries Find Error:', e); }

        let recentActivity = [];
        try {
            const Notification = require('../models/Notification');
            const notifs = await Notification.find().sort({ createdAt: -1 }).limit(5);
            recentActivity = notifs.map(n => ({
                id: n._id,
                text: n.message || n.title,
                category: n.category || 'general',
                type: n.type || 'info',
                time: n.createdAt
            }));
        } catch (e) { console.error('Recent Activity Error:', e); }

        let data = {
            totalEmployees: stats.totalEmployees || 0,
            totalMaterials: stats.totalMaterials || 0,
            activeCustomers: stats.totalCustomers || 0,
            openOrders: (await Order.countDocuments({ status: { $nin: ['Delivered', 'Completed', 'Cancelled'] } })) || 0,
            lowStockItems: lowStockMaterials.length,
            totalStockQuantity: totalStockQuantity,
            totalRevenue: revenue,
            stats: { 
                ...stats,
                revenue,
                purchaseCost,
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
                recentActivity: recentActivity || []
            }
        };

        // Vendor statistics
        try {
            const allVendors = await Vendor.find({});
            const vendorsByCategory = {};
            allVendors.forEach(v => {
                const cat = v.category || 'Other';
                vendorsByCategory[cat] = (vendorsByCategory[cat] || 0) + 1;
            });
            data.vendorStats = {
                totalVendors: stats.totalVendors || allVendors.length,
                vendorsByCategory: Object.entries(vendorsByCategory).map(([name, value]) => ({ name, value }))
            };
        } catch (e) { console.error('Vendor Stats Error:', e); }

        // Payroll Data Chart
        try {
            const payrollRaw = await Salary.aggregate([
                { $match: { status: 'Approved', payPeriod: { $exists: true } } },
                {
                    $group: {
                        _id: "$payPeriod",
                        amount: { $sum: "$netSalary" }
                    }
                },
                { $sort: { "_id": 1 } },
                { $limit: 6 }
            ]);
            data.charts.payrollData = payrollRaw.map(p => ({
                name: p._id, // Assume payPeriod is like "2023-05"
                amount: p.amount
            }));
            
            if (data.charts.payrollData.length === 0) {
                 // Return empty array instead of fallback mock
                 data.charts.payrollData = [];
            }
        } catch (e) { console.error('Payroll Aggregation Error:', e); }

        // HR & Admin Stats
        if (role === 'HR' || role === 'Admin') {
            try {
                const todayStart = new Date();
                todayStart.setHours(0,0,0,0);
                const todayEnd = new Date();
                todayEnd.setHours(23,59,59,999);

                const activeEmployeesCount = await Employee.countDocuments({});

                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                const newJoinersCount = await Employee.countDocuments({
                    joinDate: { $gte: thirtyDaysAgo }
                });

                const deptStats = await Employee.aggregate([
                    { $group: { _id: "$department", value: { $sum: 1 } } }
                ]);
                
                const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#7c3aed', '#0d9488'];
                const employeeDistribution = deptStats.map((d, index) => ({
                    name: d._id || 'Other',
                    value: d.value,
                    percentage: `${((d.value / activeEmployeesCount) * 100).toFixed(1)}%`,
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

                const allAttendances = await Attendance.find({ date: { $gte: todayStart, $lte: todayEnd } });
                const allLeaves = await Leave.find({ status: 'Approved', startDate: { $lte: todayEnd }, endDate: { $gte: todayStart } });
                const attendanceMap = {};
                allAttendances.forEach(a => { attendanceMap[a.employeeId?.toString()] = a; });
                const leaveMap = {};
                allLeaves.forEach(l => { leaveMap[l.employeeId?.toString()] = true; });

                const now = new Date();
                const defaultStatus = now.getHours() < 14 ? 'Not Checked In' : 'Absent';

                const allEmployees = await Employee.find({});
                let presentToday = 0;
                let absentToday = 0;

                allEmployees.forEach(emp => {
                    const empId = emp.id?.toString();
                    let finalStatus = defaultStatus;
                    if (attendanceMap[empId]) {
                        finalStatus = attendanceMap[empId].status;
                    } else if (leaveMap[empId]) {
                        finalStatus = 'On Leave';
                    }
                    if (finalStatus === 'Present' || finalStatus === 'Late') presentToday++;
                    if (finalStatus === 'Absent') absentToday++;
                });
                const onLeave = await Leave.countDocuments({ status: 'Approved', startDate: { $lte: todayEnd }, endDate: { $gte: todayStart } });
                const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });

                data.hrStats = {
                    totalEmployees: activeEmployeesCount,
                    presentToday: presentToday,
                    onLeave: onLeave,
                    pending: pendingLeaves,
                    absentToday: absentToday,
                    newJoiners: newJoinersCount,
                    employeeDistribution,
                    recentEmployees: recentEmployeesFormatted,
                    attendanceHistory
                };
            } catch (err) {
                console.error('HR Dashboard Stats Error:', err);
                data.hrStats = { totalEmployees: stats.totalEmployees, presentToday: 0, onLeave: 0, newJoiners: 0, employeeDistribution: [], recentEmployees: [], attendanceHistory: [] };
            }
        } 
        
        // Sales Stats
        if (role === 'Sales' || role === 'Admin') {
            try {
                const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
                data.salesStats = {
                    recentCustomers: await Customer.countDocuments({ createdAt: { $gte: firstDayOfMonth } })
                };
            } catch (e) { console.error('Sales Pipeline Aggregation Error:', e); }
        }

        // Manager Stats
        if (role === 'Manager' || role === 'Admin') {
            try {
                data.managerStats = {
                    teamMembers: stats.totalEmployees,
                    activeProjects: await Order.countDocuments({ status: { $in: ['Pending', 'Awaiting Approval', 'Approved', 'In Progress'] } }),
                    pendingApprovals: (await Order.countDocuments({ status: 'Awaiting Approval' })) + (await Leave.countDocuments({ status: 'Pending' })),
                    teamProductivity: 0 // Default to 0 instead of placeholder
                };
            } catch (e) { console.error('Manager Stats Error:', e); }
        }

        // Employee Stats
        if (role === 'Employee') {
             try {
                 const empRecord = await Employee.findOne({ userId: req.user.id });
                 if (empRecord) {
                     const todayStart = new Date(); todayStart.setHours(0,0,0,0);
                     const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);
                     const att = await Attendance.findOne({ employeeId: empRecord._id, date: { $gte: todayStart, $lte: todayEnd } });
                     data.employeeStats = {
                         attendanceToday: att ? att.status : 'Not Marked',
                         myPendingLeaves: await Leave.countDocuments({ employeeId: empRecord._id, status: 'Pending' })
                     };
                 }
             } catch(e) { console.error('Employee Stats Error:', e); }
        }

        res.json(data);
    } catch (error) {
        console.error('Final Dashboard Stats Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats };
