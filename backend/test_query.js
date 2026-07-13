const mongoose = require('mongoose');
const Order = require('./src/models/Order');
const Vendor = require('./src/models/Vendor');
const Customer = require('./src/models/Customer');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smtbs', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(async () => {
    console.log('Connected to DB');
    try {
        const orders = await Order.find({})
            .populate('customer', 'name email phone company address')
            .populate('vendor', 'name email phone address contactPerson')
            .populate('items.material', 'name price quantity')
            .sort({ createdAt: -1 })
            .limit(1);
        console.log('Success:', orders);
    } catch (e) {
        console.error('Error:', e);
    }
    process.exit(0);
});
