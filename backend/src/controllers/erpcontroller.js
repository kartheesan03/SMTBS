const Order = require('../models/Order');

const getERPStats = async (req, res) => {
    try {
        const orders = await Order.find({});

        let openOrders = 0;
        let approvedOrders = 0;
        let totalPurchaseOrders = 0;
        const statusCounts = {};
        
        orders.forEach(o => {
            if (o.type === 'Purchase') {
                totalPurchaseOrders++;
            }
            if (o.status !== 'Completed' && o.status !== 'Cancelled') {
                openOrders++;
            }
            if (o.status === 'Approved') {
                approvedOrders++;
            }
            
            statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
        });

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
            pendingInvoices: 18, // Can be hardcoded or 0 if invoices not tracked
            totalExpenses: "₹1.25 Cr", // Placeholder since we don't have expenses in db
            totalPurchaseOrders,
            orderSummary
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getERPStats };
