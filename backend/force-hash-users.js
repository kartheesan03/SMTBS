const db = require('./backend/src/config/sequelize');
const User = require('./backend/src/models/User');
const bcrypt = require('bcryptjs');

const defaultUsers = [
    { email: 'admin@smtbms.com', password: 'admin123', role: 'Admin' },
    { email: 'hr@smtbms.com', password: 'hr123', role: 'HR' },
    { email: 'manager@smtbms.com', password: 'manager123', role: 'Manager' },
    { email: 'employee@smtbms.com', password: 'employee123', role: 'Employee' },
    { email: 'sales@smtbms.com', password: 'sales123', role: 'Sales' }
];

async function run() {
    try {
        await db.authenticate();
        console.log('DB connected.');

        for (const u of defaultUsers) {
            const user = await User.sequelizeModel.findOne({ where: { email: u.email } });
            if (user) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(u.password, salt);
                
                // Use .update() directly to bypass any hook weirdness and force the hashed password
                await User.sequelizeModel.update(
                    { password: hashedPassword, role: u.role }, 
                    { where: { email: u.email } }
                );
                
                console.log(`Force hashed and updated: ${u.email}`);
            } else {
                console.log(`User not found: ${u.email}`);
            }
        }
    } catch (e) {
        console.error('Error:', e);
    }
    process.exit(0);
}

run();
