require('dotenv').config();
const Order = require('./src/models/Order');

async function removeDummy() {
    try {
        const orders = await Order.find({});
        console.log('Orders found in MySQL:', orders.length);
        
        const dummy = orders.filter(o => {
            const num = String(o.orderNumber || o.poNumber);
            return num.includes('TEST-PO') || num.includes('ORD-790710');
        });
        
        console.log('Dummy to delete:', dummy.length);
        
        for (const d of dummy) {
            await Order.findByIdAndDelete(d._id);
        }
        
        console.log('Deleted dummy orders');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
removeDummy();
