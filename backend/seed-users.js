const bcrypt = require('bcryptjs');
const sequelize = require('./src/config/sequelize');
const User = require('./src/models/User');

const defaultUsers = [
    { name: 'System Admin', email: 'admin@smtbms.com', password: 'admin123', role: 'Admin' },
    { name: 'HR Manager', email: 'hr@smtbms.com', password: 'hr123', role: 'HR' },
    { name: 'General Manager', email: 'manager@smtbms.com', password: 'manager123', role: 'Manager' },
    { name: 'Staff Employee', email: 'employee@smtbms.com', password: 'employee123', role: 'Employee' },
    { name: 'Sales Rep', email: 'sales@smtbms.com', password: 'sales123', role: 'Sales' }
];

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        for (const userData of defaultUsers) {
            let user = await User.findOne({ email: userData.email });

            if (!user) {
                console.log(`${userData.role} user not found. Creating...`);
                await User.create({
                    name: userData.name,
                    email: userData.email,
                    password: userData.password, 
                    role: userData.role,
                    active: true,
                    isProfileComplete: true
                });
                console.log(`Created ${userData.email}`);
            } else {
                console.log(`${userData.email} found. Verifying password and role...`);
                
                let changed = false;
                
                // Ensure role
                if (user.role !== userData.role && !(userData.role === 'Admin' && user.role === 'Super Admin')) {
                    user.role = userData.role;
                    changed = true;
                }

                // Verify password using bcrypt compare
                const isMatch = await bcrypt.compare(userData.password, user.password);
                if (!isMatch) {
                    console.log(`Password for ${userData.email} is wrong or not hashed properly. Resetting...`);
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(userData.password, salt);
                    changed = true;
                }
                
                if (changed) {
                    await user.save();
                    console.log(`Updated ${userData.email}`);
                } else {
                    console.log(`${userData.email} is already correct.`);
                }
            }
        }

    } catch (error) {
        console.error('Error seeding users:', error);
    } finally {
        process.exit();
    }
})();
