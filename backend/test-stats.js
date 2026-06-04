const sequelize = require('./src/config/sequelize');
const Material = require('./src/models/Material');
const Employee = require('./src/models/Employee');
const Order = require('./src/models/Order');
const Customer = require('./src/models/Customer');
const Lead = require('./src/models/Lead');

async function test() {
    try {
        await sequelize.authenticate();
        console.log('DB connected');
        const count1 = await Material.countDocuments();
        console.log('Material:', count1);
        const count2 = await Employee.countDocuments();
        console.log('Employee:', count2);
        const count3 = await Order.countDocuments();
        console.log('Order:', count3);
        const count4 = await Customer.countDocuments();
        console.log('Customer:', count4);
        const count5 = await Lead.countDocuments();
        console.log('Lead:', count5);
    } catch(e) {
        console.error(e);
    }
}
test();
