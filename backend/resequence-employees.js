require('dotenv').config();
const sequelize = require('./src/config/sequelize');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        const [remaining] = await sequelize.query(
            `SELECT id, employeeId, firstName, lastName FROM Employee ORDER BY id`
        );

        console.log('Current employees:', JSON.stringify(remaining));

        // Use temp IDs first to avoid unique constraint conflicts
        // Step 1: set all to temp IDs
        for (let i = 0; i < remaining.length; i++) {
            await sequelize.query(
                `UPDATE Employee SET employeeId = 'TEMP${i+1}' WHERE id = ${remaining[i].id}`
            );
        }
        console.log('Set temp IDs done.');

        // Step 2: Sort by original employeeId to determine correct order
        const sorted = [...remaining].sort((a, b) => {
            const aNum = parseInt(a.employeeId.replace('EMP', ''));
            const bNum = parseInt(b.employeeId.replace('EMP', ''));
            return aNum - bNum;
        });

        // Step 3: Assign sequential IDs
        for (let i = 0; i < sorted.length; i++) {
            const newId = `EMP${String(i + 1).padStart(3, '0')}`;
            await sequelize.query(
                `UPDATE Employee SET employeeId = '${newId}' WHERE id = ${sorted[i].id}`
            );
            console.log(`  ${sorted[i].firstName} ${sorted[i].lastName}: was ${sorted[i].employeeId} → now ${newId}`);
        }

        console.log('\n✅ Employee IDs re-sequenced successfully!');

        // Show final state
        const [final] = await sequelize.query(
            `SELECT id, employeeId, firstName, lastName FROM Employee ORDER BY employeeId`
        );
        console.log('\nFinal employee list:');
        final.forEach(e => console.log(`  ${e.employeeId}: ${e.firstName} ${e.lastName}`));

    } catch (e) {
        console.error('Error:', e.message, e.stack);
    } finally {
        process.exit(0);
    }
})();
