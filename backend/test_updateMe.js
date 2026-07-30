const sequelize = require('./src/config/sequelize');
const Employee = require('./src/models/Employee');
const User = require('./src/models/User');

async function test() {
    try {
        const emp = await Employee.findOne({ contact: 'employee@smtbms.com' });
        console.log("Current emp first name:", emp.firstName);
        console.log("emp.userIdField:", emp.userIdField);
        console.log("emp.userId (proxy):", emp.userId);

        if (emp.userId) {
            const user = await User.findById(emp.userId);
            if (user) {
                console.log("Found user via emp.userId:", user.name);
            } else {
                console.log("Could not find user via emp.userId!");
            }
        } else {
            console.log("emp.userId is not set!");
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
test();
