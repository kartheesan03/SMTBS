const sequelize = require('./src/config/sequelize');

async function updateEmails() {
    try {
        const updates = [
            { firstName: 'Priya', lastName: 'Devi', email: 'hr@smtbms.com', genericId: 2 },
            { firstName: 'Murugan', lastName: 'Selvam', email: 'manager@smtbms.com', genericId: 3 },
            { firstName: 'Rajesh', lastName: 'Kannan', email: 'employee@smtbms.com', genericId: 4 },
            { firstName: 'Senthil', lastName: 'Kumar', email: 'sales@smtbms.com', genericId: 5 }
        ];

        for (const update of updates) {
            // Delete the placeholder user taking up the email (Ignore errors if already deleted)
            try {
                await sequelize.query(`DELETE FROM User WHERE id = ${update.genericId}`);
            } catch(e) {}
            
            // Update User table
            await sequelize.query(`
                UPDATE User 
                SET email = '${update.email}'
                WHERE id = (
                    SELECT userIdField FROM Employee 
                    WHERE firstName = '${update.firstName}' AND lastName = '${update.lastName}'
                )
            `);
            
            // Update Employee table (only contact column exists)
            await sequelize.query(`
                UPDATE Employee 
                SET contact = '${update.email}'
                WHERE firstName = '${update.firstName}' AND lastName = '${update.lastName}'
            `);
            
            console.log(`Updated ${update.firstName} ${update.lastName} to ${update.email}`);
        }
        
        console.log("All updates completed successfully.");
    } catch (err) {
        console.error("Error updating database:", err);
    } finally {
        process.exit(0);
    }
}

updateEmails();
