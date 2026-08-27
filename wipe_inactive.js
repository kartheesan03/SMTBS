const sequelize = require('./backend/src/config/sequelize');
const Employee = require('./backend/src/models/Employee');
const User = require('./backend/src/models/User');

async function wipeInactive() {
    const inactiveUsers = await User.find({ active: false });
    console.log(`Found ${inactiveUsers.length} inactive users to wipe.`);

    for (const user of inactiveUsers) {
        const userId = user.id || user._id;
        console.log(`Wiping user ${userId} (${user.email})...`);

        const emp = await Employee.findOne({ userIdField: userId });
        const empId = emp ? (emp.id || emp._id) : null;

        const Attendance = require('./backend/src/models/Attendance');
        const Leave = require('./backend/src/models/Leave');
        const Salary = require('./backend/src/models/Salary');
        const Notification = require('./backend/src/models/Notification');
        const AuditLog = require('./backend/src/models/AuditLog');

        if (empId) {
            if (Attendance) await Attendance.deleteMany({ employeeId: empId });
            if (Leave) await Leave.deleteMany({ employeeId: empId });
            if (Salary) await Salary.deleteMany({ employeeId: empId });
        }
        if (Notification) await Notification.deleteMany({ userId });
        if (AuditLog) await AuditLog.deleteMany({ userId });

        const nullifyQueries = [
            `UPDATE Orders SET createdById = NULL WHERE createdById = ${userId}`,
            `UPDATE Orders SET updatedById = NULL WHERE updatedById = ${userId}`,
            `UPDATE Tickets SET assignedToId = NULL WHERE assignedToId = ${userId}`,
            `UPDATE Tickets SET submittedById = NULL WHERE submittedById = ${userId}`,
            `UPDATE Tasks SET assignedById = NULL WHERE assignedById = ${userId}`
        ];
        for (let q of nullifyQueries) {
            try { await sequelize.query(q); } catch (e) {} 
        }

        if (emp) await emp.deleteOne();
        await user.deleteOne();
        console.log(`Successfully wiped user ${userId}.`);
    }
}
wipeInactive().catch(console.error).finally(() => process.exit());
