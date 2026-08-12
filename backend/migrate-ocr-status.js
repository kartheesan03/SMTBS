const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.MYSQL_URL, {
    dialect: 'mysql',
    logging: false
});

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('DB connected');
        
        // Alter the ENUM to add new statuses
        await sequelize.query(`
            ALTER TABLE OcrDocument 
            MODIFY COLUMN status ENUM(
                'Processing',
                'Extracted',
                'Needs Review',
                'Pending Approval',
                'Approved',
                'Rejected',
                'Failed'
            ) NOT NULL DEFAULT 'Extracted';
        `);
        console.log('✓ OcrDocument status ENUM updated');
        
        // Add rejectReason column if not exists
        try {
            await sequelize.query(`
                ALTER TABLE OcrDocument 
                ADD COLUMN rejectReason VARCHAR(255) NULL;
            `);
            console.log('✓ rejectReason column added');
        } catch(e) {
            if (e.message.includes('Duplicate column')) {
                console.log('rejectReason column already exists, skipping');
            } else {
                throw e;
            }
        }
        
        console.log('\nMigration complete!');
    } catch(err) {
        console.error('Migration error:', err.message);
    } finally {
        await sequelize.close();
    }
}

migrate();
