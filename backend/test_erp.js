const mongoose = require('mongoose');
const Order = require('./src/models/Order');

async function test() {
    try {
        const c1 = await Order.countDocuments({});
        console.log('totalOrders:', c1);
        
        const c2 = await Order.countDocuments({ orderType: 'sales' });
        console.log('sales:', c2);

        const rev = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' }, orderType: 'sales', totalAmount: { $exists: true } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        console.log('rev:', rev);
    } catch(e) {
        console.error('ERROR:', e);
    }
}
test();
