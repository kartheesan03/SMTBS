require('dotenv').config();
const sequelize = require('./src/config/sequelize');
const User = require('./src/models/User');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected.');
        
        // Test the exact same findOne call the auth controller uses
        const user = await User.findOne({ email: 'admin@smtbms.com' });
        console.log('User.findOne result:', user ? JSON.stringify({ email: user.email, role: user.role, active: user.active }) : 'NULL - NOT FOUND');
        
        if (user) {
            const match = await user.matchPassword('admin123');
            console.log('matchPassword("admin123"):', match);
        }
        
    } catch (e) {
        console.error('Error:', e.message, e.stack);
    } finally {
        process.exit(0);
    }
})();
