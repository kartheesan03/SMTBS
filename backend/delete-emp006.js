const sequelize = require('./src/config/sequelize');

async function deleteEmp() {
    try {
        await sequelize.query("DELETE FROM Employee WHERE employeeId='EMP006'");
        console.log("Deleted EMP006");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
deleteEmp();
