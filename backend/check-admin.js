require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('./src/config/sequelize');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to SQLite DB.');
        
        const [results] = await sequelize.query("SELECT email, password, role, active FROM User WHERE email='admin@smtbms.com'");
        if (!results.length) {
            console.log('Admin user NOT FOUND in database!');
            process.exit(1);
        }
        
        const u = results[0];
        console.log('User found:', { email: u.email, role: u.role, active: u.active });
        console.log('Password hash:', u.password);
        
        // Test common passwords
        const passwords = ['admin123', 'Admin123', 'admin', 'password', '12345678', 'smtbms123', 'Admin@123'];
        for (const pw of passwords) {
            const match = await bcrypt.compare(pw, u.password);
            if (match) console.log(`✅ MATCH: password is "${pw}"`);
        }
        
        // Reset password to admin123
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash('admin123', salt);
        await sequelize.query(`UPDATE User SET password='${newHash}' WHERE email='admin@smtbms.com'`);
        console.log('\nPassword reset to "admin123" successfully!');
        
        // Verify
        const verify = await bcrypt.compare('admin123', newHash);
        console.log('Verification:', verify ? '✅ Success' : '❌ Failed');
        
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        process.exit(0);
    }
})();
