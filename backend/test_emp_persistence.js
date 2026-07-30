const sequelize = require('./src/config/sequelize');
const Employee = require('./src/models/Employee');

async function test() {
    try {
        const emp = await Employee.findOne({ contact: 'employee@smtbms.com' });
        console.log("Current Employee first name in DB:", emp.firstName);

        emp.firstName = "Test Update";
        await emp.save();
        
        console.log("Saved.");

        const emp2 = await Employee.findOne({ contact: 'employee@smtbms.com' });
        console.log("Employee first name in DB after save:", emp2.firstName);
        
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
test();
