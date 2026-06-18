/**
 * Remove all employees and their linked users EXCEPT the 5 default system accounts.
 * Handles all foreign key constraints.
 */
const sequelize = require('./src/config/sequelize');
require('./src/models/User');
require('./src/models/Employee');

const keepEmails = [
    'admin@smtbms.com',
    'hr@smtbms.com',
    'manager@smtbms.com',
    'employee@smtbms.com',
    'sales@smtbms.com'
];

async function run() {
    await sequelize.authenticate();
    console.log('✅ Connected.\n');

    // Disable FK constraints for cleanup
    await sequelize.query("PRAGMA foreign_keys = OFF;");

    // Get employees to remove
    const [allEmps] = await sequelize.query("SELECT id, employeeId, firstName, lastName, contact, userIdField FROM Employee ORDER BY id;");
    
    const removeEmpIds = [];
    const removeUserIds = [];

    for (const emp of allEmps) {
        if (keepEmails.includes(emp.contact)) {
            console.log(`  ✓ KEEP: ${emp.employeeId} ${emp.firstName} ${emp.lastName || ''} (${emp.contact})`);
        } else {
            removeEmpIds.push(emp.id);
            if (emp.userIdField) removeUserIds.push(emp.userIdField);
            console.log(`  🗑️ REMOVE: ${emp.employeeId} ${emp.firstName} ${emp.lastName || ''} (${emp.contact})`);
        }
    }

    // Protect system users + Google/Customer/Vendor users
    const [keepUsers] = await sequelize.query(`SELECT id FROM User WHERE email IN (${keepEmails.map(e => `'${e}'`).join(',')});`);
    const protectedUserIds = new Set(keepUsers.map(u => u.id));
    const [otherProtected] = await sequelize.query("SELECT id FROM User WHERE role IN ('Customer', 'Vendor') OR provider='google';");
    otherProtected.forEach(u => protectedUserIds.add(u.id));
    
    const finalRemoveUserIds = removeUserIds.filter(id => !protectedUserIds.has(id));

    console.log(`\nKeeping: ${allEmps.length - removeEmpIds.length} employees`);
    console.log(`Removing: ${removeEmpIds.length} employees + ${finalRemoveUserIds.length} users\n`);

    if (removeEmpIds.length > 0) {
        // Clean up all FK references
        const tables = ['Attendance', 'Leave', 'Salary'];
        for (const t of tables) {
            await sequelize.query(`DELETE FROM ${t} WHERE employeeId IN (${removeEmpIds.join(',')});`).catch(() => {});
        }
        await sequelize.query(`DELETE FROM Employee WHERE id IN (${removeEmpIds.join(',')});`);
        console.log(`✅ Deleted ${removeEmpIds.length} employees.`);
    }

    if (finalRemoveUserIds.length > 0) {
        // Clean up all tables referencing userId
        const userFkTables = [
            { table: 'Notification', col: 'userId' },
            { table: 'Task', col: 'assignedById' },
            { table: 'AuditLog', col: 'userId' },
            { table: 'Order', col: 'createdById' },
            { table: 'Order', col: 'updatedById' },
            { table: 'CommunicationLog', col: 'createdById' },
            { table: 'StockRequest', col: 'employeeId' },
            { table: 'StockRequest', col: 'managerId' },
            { table: 'Leave', col: 'reviewedById' },
        ];
        for (const { table, col } of userFkTables) {
            await sequelize.query(`UPDATE ${table} SET ${col} = NULL WHERE ${col} IN (${finalRemoveUserIds.join(',')});`).catch(() => {});
        }
        await sequelize.query(`DELETE FROM User WHERE id IN (${finalRemoveUserIds.join(',')});`);
        console.log(`✅ Deleted ${finalRemoveUserIds.length} user accounts.`);
    }

    // Re-enable FK constraints
    await sequelize.query("PRAGMA foreign_keys = ON;");

    // Final state
    const [emps] = await sequelize.query("SELECT employeeId, firstName, lastName, department, contact FROM Employee ORDER BY id;");
    const [users] = await sequelize.query("SELECT id, email, role, name FROM User ORDER BY id;");
    
    console.log(`\n=== FINAL STATE ===`);
    console.log(`\nEmployees (${emps.length}):`);
    emps.forEach(e => console.log(`  ${e.employeeId} ${e.firstName} ${e.lastName || ''} | ${e.department} | ${e.contact}`));
    
    console.log(`\nUsers (${users.length}):`);
    users.forEach(u => console.log(`  id=${u.id} ${u.email} | ${u.role} | ${u.name}`));

    process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
