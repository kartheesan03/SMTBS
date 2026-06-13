const sequelize = require('./src/config/sequelize');

async function check() {
    try {
        const [results] = await sequelize.query('SELECT id, name, isProfileComplete FROM User LIMIT 1;');
        console.log(results);
    } catch (e) {
        console.error('Error:', e.message);
    }
    process.exit();
}
check();
