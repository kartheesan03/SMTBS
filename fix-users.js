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
            let user = await User.sequelizeModel.findOne({ where: { email: u.email } });
            if (user) {
                user.password = u.password;
                user.role = u.role;
                await user.save(); // triggers beforeSave hook which hashes the password
                console.log('Updated user:', u.email);
            } else {
                user = await User.sequelizeModel.create({
                    name: u.name,
                    email: u.email,
                    password: u.password,
                    role: u.role,
                    active: true,
                    isProfileComplete: true
                });
                console.log('Created user:', u.email);
            }
        }
        console.log('All users fixed.');
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

run();
