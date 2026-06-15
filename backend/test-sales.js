const sequelize = require('./src/config/sequelize');
const Order = require('./src/models/Order');
const Customer = require('./src/models/Customer');
const Lead = require('./src/models/Lead');
const Employee = require('./src/models/Employee');

async function checkData() {
    try {
        await sequelize.authenticate();
        console.log("Connected to DB");
        
        const orders = await Order.findAll();
        console.log("Orders:", orders.length);
        if (orders.length > 0) {
            console.log("First Order type:", orders[0].orderType, "status:", orders[0].status);
        }
        
        const customers = await Customer.findAll();
        console.log("Customers:", customers.length);
        if (customers.length > 0) {
            console.log("First Customer status:", customers[0].status, "source:", customers[0].source);
        }
        
        const leads = await Lead.findAll();
        console.log("Leads:", leads.length);
        if (leads.length > 0) {
            console.log("First Lead status:", leads[0].status, "source:", leads[0].source);
        }
        
    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit(0);
    }
}
checkData();
