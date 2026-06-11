const Order = require('../models/Order');

const getERPStats = async (req, res) => {
    try {
        const orders = await Order.find({});

        let totalOrders = 0;
        let totalSalesOrders = 0;
        let totalPurchaseOrders = 0;
        let pendingInvoices = 0;
        let totalRevenueNum = 0;
        let totalPurchaseCostNum = 0;
        let purchaseStatusCounts = {};
        
        orders.forEach(o => {
            totalOrders++;

            if (['Pending', 'Overdue', 'Partially Paid'].includes(o.paymentStatus)) {
                pendingInvoices++;
            }

            if (o.orderType === 'sales') {
                totalSalesOrders++;
                if (['Approved', 'Delivered', 'Completed', 'Received'].includes(o.status)) {
                    totalRevenueNum += (o.totalAmount || 0);
                }
            } else if (o.orderType === 'purchase') {
                totalPurchaseOrders++;
                if (['Approved', 'Delivered', 'Completed', 'Received'].includes(o.status)) {
                    totalPurchaseCostNum += (o.totalAmount || 0);
                }
                purchaseStatusCounts[o.status] = (purchaseStatusCounts[o.status] || 0) + 1;
            }
        });

        const formatCurrency = (num) => {
            if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
            if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
            return `₹${num.toLocaleString()}`;
        };

        // Map summary exactly to chart expected format
        const orderSummary = [
            { name: 'Pending', value: purchaseStatusCounts['Pending'] || 0, color: '#2563eb' },
            { name: 'Confirmed', value: purchaseStatusCounts['Confirmed'] || 0, color: '#8b5cf6' },
            { name: 'Approved', value: purchaseStatusCounts['Approved'] || 0, color: '#10b981' },
            { name: 'Delivered', value: purchaseStatusCounts['Delivered'] || 0, color: '#f59e0b' },
            { name: 'Cancelled', value: purchaseStatusCounts['Cancelled'] || 0, color: '#ef4444' }
        ];

        // Format to percentage
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
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getERPStats };
