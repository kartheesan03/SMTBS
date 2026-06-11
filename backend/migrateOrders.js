const sequelize = require('./src/config/sequelize');

async function migrateOrders() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        
        // Add columns manually
        const queries = [
            'ALTER TABLE "Order" ADD COLUMN invoiceNumber VARCHAR(255);',
            'ALTER TABLE "Order" ADD COLUMN invoiceDate DATETIME;',
            'ALTER TABLE "Order" ADD COLUMN invoiceDueDate DATETIME;',
            'ALTER TABLE "Order" ADD COLUMN paymentStatus VARCHAR(255) DEFAULT \'Pending\';',
            'ALTER TABLE "Order" ADD COLUMN invoiceGenerated BOOLEAN DEFAULT 0;'
        ];
        
        for (const query of queries) {
            try {
                await sequelize.query(query);
                console.log('Executed:', query);
            } catch (err) {
                if (err.message.includes('duplicate column name')) {
                    console.log('Column already exists:', query);
                } else {
                    console.error('Error executing query:', query, err.message);
                }
            }
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
}

migrateOrders();
