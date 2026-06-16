const db = require('./backend/src/config/sequelize');
const User = require('./backend/src/models/User');

const defaultUsers = [
    { name: 'System Admin', email: 'admin@smtbms.com', password: 'admin123', role: 'Admin' },
    { name: 'HR Manager', email: 'hr@smtbms.com', password: 'hr123', role: 'HR' },
    { name: 'General Manager', email: 'manager@smtbms.com', password: 'manager123', role: 'Manager' },
    { name: 'Employee User', email: 'employee@smtbms.com', password: 'employee123', role: 'Employee' },
    { name: 'Sales Exec', email: 'sales@smtbms.com', password: 'sales123', role: 'Sales' }
];

async function run() {
    try {
        await db.authenticate();
        console.log('DB connected.');

        for (const u of defaultUsers) {
            // Delete old wrong users to be safe
            await User.sequelizeModel.destroy({ where: { email: u.email } });
            console.log(`Deleted old user: ${u.email}`);

            // Recreate users so beforeSave hooks properly bcrypt hash the password
            const user = await User.sequelizeModel.create({
                name: u.name,
                email: u.email,
                password: u.password,
                role: u.role,
                active: true,
                isProfileComplete: true
            });
            console.log(`Seeded user properly with bcrypt: ${u.email}`);
        }
        
        console.log('All default users force-reseeded successfully!');
    } catch (e) {
        console.error('Seeding Error:', e);
    }
    process.exit(0);
}

run();
