const sequelize = require('./src/config/sequelize');

async function addColumn() {
    try {
        await sequelize.authenticate();
        await sequelize.query(`ALTER TABLE Vendor ADD COLUMN status VARCHAR(255) DEFAULT 'Vendor Created';`);
        console.log("Added status column to Vendor.");
    } catch(e) {
        if(e.message.includes('duplicate column name')) {
            console.log("Column already exists.");
        } else {
            console.error(e);
        }
    }
}
addColumn();
