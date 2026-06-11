const Order = require('../models/Order');

const getERPStats = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments({});
        const totalSalesOrders = await Order.countDocuments({ orderType: 'sales' });
        const totalPurchaseOrders = await Order.countDocuments({ orderType: 'purchase' });
        const pendingInvoices = await Order.countDocuments({ paymentStatus: { $in: ['Pending', 'Overdue', 'Partially Paid'] } });

        const revenueResult = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' }, orderType: 'sales', totalAmount: { $exists: true } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        const totalRevenueNum = (revenueResult && revenueResult.length > 0) ? revenueResult[0].total : 0;

        const purchaseCostResult = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' }, orderType: 'purchase', totalAmount: { $exists: true } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        const totalPurchaseCostNum = (purchaseCostResult && purchaseCostResult.length > 0) ? purchaseCostResult[0].total : 0;

        const formatCurrency = (num) => {
            if (!num) return '₹0';
            if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
            if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
            return `₹${num.toLocaleString()}`;
        };

        // Purchase order summary for the chart
        const poStatuses = await Order.aggregate([
            { $match: { orderType: 'purchase' } },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        
        const purchaseStatusCounts = {};
        if (poStatuses && poStatuses.length > 0) {
            poStatuses.forEach(s => {
                purchaseStatusCounts[s._id] = s.count;
            });
        }

        const orderSummary = [
            { name: 'Pending', value: purchaseStatusCounts['Pending'] || 0, color: '#2563eb' },
            { name: 'Confirmed', value: purchaseStatusCounts['Confirmed'] || 0, color: '#8b5cf6' },
            { name: 'Approved', value: purchaseStatusCounts['Approved'] || 0, color: '#10b981' },
            { name: 'Delivered', value: purchaseStatusCounts['Delivered'] || 0, color: '#f59e0b' },
            { name: 'Cancelled', value: purchaseStatusCounts['Cancelled'] || 0, color: '#ef4444' }
        ];

        const totalSummarized = orderSummary.reduce((acc, curr) => acc + curr.value, 0);
        if (totalSummarized > 0) {
            orderSummary.forEach(item => {
                item.percentage = ((item.value / totalSummarized) * 100).toFixed(1) + '%';
            });
        } else {
            orderSummary.forEach(item => {
                item.percentage = '0%';
            });
        }

        res.json({
            totalOrders,
            totalSalesOrders,
            totalPurchaseOrders,
            pendingInvoices,
            totalRevenue: formatCurrency(totalRevenueNum),
            totalPurchaseCost: formatCurrency(totalPurchaseCostNum),
            orderSummary
        });
    } catch (error) {
        console.error("ERP Stats Error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getERPStats };
