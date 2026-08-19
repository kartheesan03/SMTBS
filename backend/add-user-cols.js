const sequelize = require('./src/config/sequelize');

async function addColumns() {
    try {
        await sequelize.authenticate();
        await sequelize.query('ALTER TABLE Users ADD COLUMN birthday DATE;');
        console.log('Added birthday column.');
    } catch(e) { console.log('Birthday col might exist:', e.message); }

    try {
        await sequelize.query('ALTER TABLE Users ADD COLUMN bio TEXT;');
        console.log('Added bio column.');
    } catch(e) { console.log('Bio col might exist:', e.message); }

    try {
        await sequelize.query('ALTER TABLE Users ADD COLUMN skills VARCHAR(255);');
        console.log('Added skills column.');
    } catch(e) { console.log('Skills col might exist:', e.message); }

    process.exit();
}

addColumns();
