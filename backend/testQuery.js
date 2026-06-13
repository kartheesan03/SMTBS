const mongooseBridge = require('./src/config/mongoose-bridge');
const Customer = require('./src/models/Customer');
const Vendor = require('./src/models/Vendor');
const Material = require('./src/models/Material');
const Order = require('./src/models/Order');

async function check() {
    try {
        const customers = await Customer.find({});
        console.log('Customers:', customers);

        const vendors = await Vendor.find({});
        console.log('Vendors:', vendors);

        const materials = await Material.find({});
        console.log('Materials:', materials);

        const orders = await Order.find({});
        console.log('Orders:', orders);
    } catch(e) {
        console.error(e);
    }
    process.exit();
}

check();
