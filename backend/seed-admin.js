const bcrypt = require('bcryptjs');
const sequelize = require('./src/config/sequelize');
const User = require('./src/models/User');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        const email = 'admin@smtbms.com';
        const rawPassword = 'admin123';
        const role = 'Admin';
        
        // Find existing user
        let user = await User.findOne({ email });

        if (!user) {
            console.log(`Admin user not found. Creating default admin...`);
            // Create user
            user = await User.create({
                name: 'System Admin',
                email: email,
                password: rawPassword, // The User model beforeSave hook handles bcrypt hashing
                role: role,
                active: true,
                isProfileComplete: true
            });
            console.log('Default admin created successfully.');
        } else {
            console.log(`Admin user found. Verifying password and role...`);
            
            // Ensure role
            if (user.role !== 'Admin' && user.role !== 'Super Admin') {
                user.role = 'Admin';
            }

            // Verify password using bcrypt compare
            const isMatch = user.password ? await bcrypt.compare(rawPassword, user.password) : false;
            if (!isMatch) {
                console.log('Password is wrong or not hashed properly. Resetting password...');
                // Hash manually and use direct update to BYPASS the beforeSave hook
                // (otherwise the hook double-hashes the already-hashed value)
                const salt = await bcrypt.genSalt(10);
                const hashed = await bcrypt.hash(rawPassword, salt);
                await User.sequelizeModel.update(
                    { password: hashed, role: user.role !== 'Admin' && user.role !== 'Super Admin' ? 'Admin' : user.role },
                    { where: { email }, hooks: false }
                );
                console.log('Password reset to admin123 (hashed). Used hooks:false to prevent double-hashing.');
            } else {
                console.log('Password is correct.');
                // Still save role fix if needed
                if (user.role !== 'Admin' && user.role !== 'Super Admin') {
                    await User.sequelizeModel.update(
                        { role: 'Admin' },
                        { where: { email }, hooks: false }
                    );
                }
            }
            console.log('Admin user verified successfully.');
        }

    } catch (error) {
        console.error('Error seeding admin user:', error);
    } finally {
        process.exit();
    }
})();
