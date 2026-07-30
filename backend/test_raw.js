const sequelize = require('./src/config/sequelize');
const User = require('./src/models/User');
const Employee = require('./src/models/Employee');

async function test() {
    try {
        console.log("---- Fetching from DB ----");
        const user = await User.findOne({ email: 'employee@smtbms.com' });
        const employee = await Employee.findOne({ contact: 'employee@smtbms.com' });
        
        console.log("User Name:", user ? user.name : "Not found");
        console.log("User Email:", user ? user.email : "Not found");
        console.log("Employee Name:", employee ? `${employee.firstName} ${employee.lastName}` : "Not found");
        console.log("Employee Contact:", employee ? employee.contact : "Not found");
        
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
test();
