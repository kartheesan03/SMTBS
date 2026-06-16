const User = require('./backend/src/models/User');
const db = require('./backend/src/config/sequelize');

async function run() {
    await db.authenticate();
    const admin = await User.sequelizeModel.findOne({ where: { email: 'admin@smtbms.com' } });
    if (!admin) return console.log('no admin');
    
    // Create token like authController does
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });
    
    try {
        const res = await fetch('http://localhost:5000/api/employees', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        console.log('STATUS:', res.status);
        console.log('DATA:', JSON.stringify(data, null, 2).substring(0, 500));
    } catch(err) {
        console.error('ERROR:', err);
    }
    process.exit(0);
}
run();
