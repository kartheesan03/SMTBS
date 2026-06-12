const sequelize = require('./src/config/sequelize');

async function fixDB() {
    try {
        await sequelize.query("ALTER TABLE Customer ADD COLUMN customerType VARCHAR(255) DEFAULT 'Individual'");
        console.log('Successfully added customerType to Customer');
    } catch (err) {
        console.error('Error altering table Customer:', err.message);
    }
}

fixDB();
