const Order = require('../models/Order');

const getERPStats = async (req, res) => {
    try {
        const orders = await Order.find({});

        let openOrders = 0;
        let approvedOrders = 0;
        let totalPurchaseOrders = 0;
        let pendingInvoices = 0;
        let totalExpensesNum = 0;
        let statusCounts = {};
        
        orders.forEach(o => {
            if (o.type === 'Purchase') {
                totalPurchaseOrders++;
                if (['Pending', 'Awaiting Approval'].includes(o.status)) {
                    pendingInvoices++;
                }
                if (['Approved', 'Delivered', 'Completed', 'Received'].includes(o.status)) {
                    totalExpensesNum += (o.totalAmount || 0);
                }
            }
            if (o.status !== 'Completed' && o.status !== 'Cancelled') {
                openOrders++;
            }
            if (o.status === 'Approved') {
                approvedOrders++;
            }
            
            statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
        });

        const formatCurrency = (num) => {
            if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
            if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
            return `₹${num.toLocaleString()}`;
        };

        // Map summary exactly to chart expected format
        const orderSummary = [
            { name: 'Draft/Pending', value: (statusCounts['Pending'] || 0) + (statusCounts['Awaiting Approval'] || 0), color: '#2563eb' },
            { name: 'Approved', value: statusCounts['Approved'] || 0, color: '#10b981' },
            { name: 'Received/Delivered', value: (statusCounts['Received'] || 0) + (statusCounts['Delivered'] || 0), color: '#f59e0b' },
            { name: 'Cancelled', value: statusCounts['Cancelled'] || 0, color: '#ef4444' }
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
            openOrders,
            approvedOrders,
            pendingInvoices,
            totalExpenses: formatCurrency(totalExpensesNum),
            totalPurchaseOrders,
            orderSummary
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getERPStats };
