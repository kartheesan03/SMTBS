const sequelize = require('./src/config/sequelize');

async function check() {
    try {
        const [emp] = await sequelize.query(`SELECT * FROM Employee WHERE employeeId='EMP006'`);
        console.log("Employee: ", emp);
        if (emp.length > 0) {
            const empId = emp[0].id;
            const [att] = await sequelize.query(`SELECT * FROM Attendance WHERE employeeId=${empId}`);
            console.log("Attendance: ", att.length);
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
