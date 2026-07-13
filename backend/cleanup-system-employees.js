require('dotenv').config();
const sequelize = require('./src/config/sequelize');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        // These are system/fake employee records to remove
        // EMP006 = sales@smtbms.com (Sales Team)
        // EMP007 = employee@smtbms.com (System Employee) 
        // EMP008 = hr@smtbms.com (HR Manager - system)
        // EMP009 = admin@smtbms.com (System Admin)
        const systemEmpIds = [51, 52, 53, 54]; // IDs from the query

        // First check what we're deleting
        const [toDelete] = await sequelize.query(
            `SELECT id, employeeId, firstName, lastName FROM Employee WHERE id IN (${systemEmpIds.join(',')})`
        );
        console.log('Will delete:', JSON.stringify(toDelete));

        // Delete them
        const [result] = await sequelize.query(
            `DELETE FROM Employee WHERE id IN (${systemEmpIds.join(',')})`
        );
        console.log('Deleted', systemEmpIds.length, 'system employee records.');

        // Re-order remaining employees to fix gaps in EMP IDs
        const [remaining] = await sequelize.query(
            `SELECT id, employeeId, firstName, lastName FROM Employee ORDER BY id`
        );
        console.log('\nRemaining employees:');
        remaining.forEach((e, idx) => {
            const newId = `EMP${String(idx + 1).padStart(3, '0')}`;
            console.log(`  ${e.employeeId} -> ${newId}: ${e.firstName} ${e.lastName}`);
        });

        // Update employee IDs to be sequential
        for (let i = 0; i < remaining.length; i++) {
            const newEmpId = `EMP${String(i + 1).padStart(3, '0')}`;
            if (remaining[i].employeeId !== newEmpId) {
                await sequelize.query(
                    `UPDATE Employee SET employeeId = '${newEmpId}' WHERE id = ${remaining[i].id}`
                );
                console.log(`Updated ${remaining[i].employeeId} to ${newEmpId}`);
            }
        }

        console.log('\n✅ Done! System accounts removed and Employee IDs re-sequenced.');

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        process.exit(0);
    }
})();
