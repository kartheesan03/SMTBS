const fs = require('fs');

const code = `
const getOrderFinances = async (req, res) => {
    try {
        const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
        const month = req.query.month ? parseInt(req.query.month) : null;
        
        let query = {};
        const role = req.user?.role?.toLowerCase();
        
        // Apply RBAC
        if (role === 'sales') {
            query.orderType = 'sales';
        } else if (role === 'vendor') {
            const Vendor = require('../models/Vendor');
            const vendorProfile = await Vendor.findOne({ userId: req.user._id });
            if (vendorProfile) {
                query.vendorId = vendorProfile._id || vendorProfile.id;
                query.orderType = 'purchase';
            }
        } else if (role === 'customer') {
            const Customer = require('../models/Customer');
            const customerProfile = await Customer.findOne({ userId: req.user._id });
            if (customerProfile) {
                query.customerId = customerProfile._id || customerProfile.id;
                query.orderType = 'sales';
            }
        }
        
        // We'll use Order.sequelizeModel directly to avoid Mongoose-bridge limitations with dates
        const { Op } = require('sequelize');
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59);
        
        query.orderDate = {
            [Op.between]: [startDate, endDate]
        };
        
        if (month !== null) {
            const startOfMonth = new Date(year, month - 1, 1);
            const endOfMonth = new Date(year, month, 0, 23, 59, 59);
            query.orderDate = {
                [Op.between]: [startOfMonth, endOfMonth]
            };
        }
        
        const orders = await Order.sequelizeModel.findAll({
            where: query,
            include: [
                { association: 'customer' },
                { association: 'vendor' }
            ],
            order: [['orderDate', 'ASC']]
        });
        
        if (month !== null) {
            // Detailed mode
            const salesOrders = orders.filter(o => o.orderType === 'sales');
            const purchaseOrders = orders.filter(o => o.orderType === 'purchase');
            return res.json({
                salesOrders,
                purchaseOrders
            });
        }
        
        // Aggregation mode
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const aggregated = months.map((m, i) => ({
            name: m,
            sales: 0,
            purchases: 0
        }));
        
        orders.forEach(order => {
            const orderDate = order.orderDate || order.createdAt;
            if (orderDate) {
                const mIndex = new Date(orderDate).getMonth();
                const amount = Number(order.totalAmount) || Number(order.grandTotal) || 0;
                if (order.orderType === 'sales') {
                    aggregated[mIndex].sales += amount;
                } else if (order.orderType === 'purchase') {
                    aggregated[mIndex].purchases += amount;
                }
            }
        });
        
        // Find available years for dropdown
        // Find min order date
        const allOrders = await Order.sequelizeModel.findAll({ attributes: ['orderDate', 'createdAt'] });
        let minYear = new Date().getFullYear();
        let maxYear = new Date().getFullYear();
        allOrders.forEach(o => {
            const d = new Date(o.orderDate || o.createdAt);
            if (d.getFullYear() < minYear) minYear = d.getFullYear();
            if (d.getFullYear() > maxYear) maxYear = d.getFullYear();
        });
        
        const availableYears = [];
        for (let y = maxYear; y >= minYear; y--) {
            availableYears.push(y);
        }
        if (!availableYears.includes(new Date().getFullYear())) {
            availableYears.push(new Date().getFullYear());
        }
        
        res.json({
            data: aggregated,
            availableYears: [...new Set(availableYears)].sort((a,b) => b-a)
        });
    } catch (error) {
        console.error('Error fetching order finances:', error);
        res.status(500).json({ message: error.message });
    }
};
`;

const filepath = './src/controllers/ordercontroller.js';
let content = fs.readFileSync(filepath, 'utf8');

if (!content.includes('const getOrderFinances')) {
    content = content.replace('module.exports = {', code + '\\nmodule.exports = {\\n    getOrderFinances,');
    fs.writeFileSync(filepath, content);
    console.log('Added getOrderFinances');
} else {
    console.log('getOrderFinances already exists');
}
