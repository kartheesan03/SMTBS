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
            const isMatch = await bcrypt.compare(rawPassword, user.password);
            if (!isMatch) {
                console.log('Password is wrong or not hashed properly. Resetting password...');
                // The User model beforeSave hook should hash the password if changed
                // But to be absolutely safe, let's hash it manually or let the model do it.
                // Assuming model has a hook. Let's trigger it by setting user.password
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(rawPassword, salt);
                console.log('Password reset to admin123 (hashed).');
            } else {
                console.log('Password is correct.');
            }
            
            await user.save();
            console.log('Admin user updated successfully.');
        }

    } catch (error) {
        console.error('Error seeding admin user:', error);
    } finally {
        process.exit();
    }
})();
