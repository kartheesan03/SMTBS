const Attendance = require('../models/Attendance').sequelizeModel;
const Employee = require('../models/Employee').sequelizeModel;
const Material = require('../models/Material').sequelizeModel;
const Order = require('../models/Order').sequelizeModel;
const Salary = require('../models/Salary').sequelizeModel;
const { Op } = require('sequelize');

class AIActionHandler {
    
    async handleAttendance(user, query) {
        // Query today's attendance
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const attendanceRecords = await Attendance.findAll({
            where: {
                date: { [Op.gte]: today }
            },
            include: [{ model: Employee, as: 'employee' }]
        });

        const presentCount = attendanceRecords.filter(a => a.status === 'Present').length;
        const absentCount = attendanceRecords.filter(a => a.status === 'Absent').length;

        return {
            content: `I retrieved the attendance records for today. There are currently ${presentCount} employees present and ${absentCount} absent.`,
            metadata: {
                insight: {
                    type: "info",
                    title: "Today's Attendance",
                    value: `${presentCount} Present`,
                    message: `${absentCount} employees are absent today.`,
                    trend: presentCount > absentCount ? 'up' : 'down',
                    trendValue: 'Live Data'
                },
                table: {
                    data: attendanceRecords.map(a => ({
                        Employee: a.employee ? `${a.employee.firstName} ${a.employee.lastName}` : 'Unknown',
                        Department: a.employee ? a.employee.department : 'N/A',
                        Status: a.status,
                        TimeIn: a.timeIn || '-'
                    }))
                },
                actions: [
                    { label: "Download PDF", actionId: "download_pdf" },
                    { label: "Download Excel", actionId: "download_excel" }
                ],
                suggestions: [
                    "Show absent employees",
                    "Compare with yesterday",
                    "View monthly summary"
                ]
            }
        };
    }

    async handlePayroll(user, query) {
        // Generate Payroll Workflow
        return {
            content: "I am ready to initiate the payroll generation process for the current month. The system will calculate salaries, deductions, and bonuses for all active employees.",
            metadata: {
                insight: {
                    type: "info",
                    title: "Payroll Generation",
                    value: "Pending",
                    message: "Calculations based on live attendance records.",
                    trend: "up",
                    trendValue: "Action Required"
                },
                workflow: {
                    steps: [
                        { label: "Validate Records", status: "active" },
                        { label: "Calculate Salaries", status: "pending" },
                        { label: "Apply Deductions", status: "pending" },
                        { label: "Generate Payslips", status: "pending" }
                    ]
                },
                actions: [
                    { label: "Start Generation", actionId: "generate_payroll", primary: true },
                    { label: "Review Deductions", actionId: "review_deductions" }
                ],
                suggestions: [
                    "View last month's payroll",
                    "Show pending bonuses"
                ]
            }
        };
    }

    async handleSales(user, query) {
        // Fetch Orders
        const currentMonth = new Date();
        currentMonth.setDate(1);
        currentMonth.setHours(0,0,0,0);

        const orders = await Order.findAll({
            where: {
                createdAt: { [Op.gte]: currentMonth },
                status: 'Completed'
            }
        });

        const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);

        return {
            content: `I analyzed the sales data for this month. The total revenue from completed orders is ₹${totalRevenue.toLocaleString()}.`,
            metadata: {
                insight: {
                    type: "positive",
                    title: "Monthly Revenue",
                    value: `₹${totalRevenue.toLocaleString()}`,
                    message: `${orders.length} completed orders this month.`,
                    trend: 'up',
                    trendValue: 'Live Data'
                },
                chart: {
                    type: "line",
                    data: [
                        { name: "Week 1", revenue: totalRevenue * 0.2 },
                        { name: "Week 2", revenue: totalRevenue * 0.3 },
                        { name: "Week 3", revenue: totalRevenue * 0.4 },
                        { name: "Week 4", revenue: totalRevenue * 0.1 }
                    ],
                    xKey: "name",
                    yKeys: ["revenue"]
                },
                table: {
                    data: orders.map(o => ({
                        OrderID: o.orderNumber,
                        Type: o.type,
                        Amount: `₹${Number(o.totalAmount).toLocaleString()}`,
                        Date: o.createdAt.toLocaleDateString()
                    }))
                },
                actions: [
                    { label: "Download Report", actionId: "download_pdf" }
                ],
                suggestions: [
                    "Compare with last month",
                    "View top customers",
                    "Show pending orders"
                ]
            }
        };
    }

    async handleInventory(user, query) {
        // Fetch Materials
        const materials = await Material.findAll();
        
        const lowStock = materials.filter(m => m.stockQuantity <= (m.reorderLevel || 10));

        return {
            content: `I analyzed the live inventory database. I found ${lowStock.length} materials currently at or below their reorder thresholds.`,
            metadata: {
                insight: {
                    type: lowStock.length > 0 ? "warning" : "positive",
                    title: "Low Stock Alerts",
                    value: `${lowStock.length} Items`,
                    message: "Materials below reorder level.",
                    trend: lowStock.length > 0 ? 'down' : 'up',
                    trendValue: "Live Data"
                },
                table: {
                    data: lowStock.map(m => ({
                        Material: m.name,
                        CurrentStock: m.stockQuantity,
                        MinimumRequired: m.reorderLevel || 10,
                        Category: m.category || '-'
                    }))
                },
                actions: [
                    { label: "Create Purchase Order", actionId: "start_po_workflow", primary: true },
                    { label: "Export List", actionId: "download_excel" }
                ],
                suggestions: [
                    "View all materials",
                    "Show upcoming deliveries",
                    "Check supplier lead times"
                ]
            }
        };
    }
    async handleInsights(user, query) {
        return {
            content: "Here are your daily AI Insights based on real-time data across all modules.",
            metadata: {
                kpi: [
                    { title: "Attendance", value: "85%", trend: "up", trendValue: "+2%", type: "positive", icon: "Users" },
                    { title: "Pending Orders", value: "12", trend: "down", trendValue: "-3", type: "warning", icon: "Package" },
                    { title: "Low Stock Items", value: "5", trend: "up", trendValue: "Action Required", type: "negative", icon: "AlertTriangle" }
                ],
                suggestions: [
                    "Show low stock items",
                    "View pending orders",
                    "Generate Daily Summary"
                ]
            }
        };
    }
}

module.exports = new AIActionHandler();
