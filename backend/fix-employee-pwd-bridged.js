const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

async function check() {
    const user = await User.findOne({ email: 'employee@smtbms.com' });
    console.log("Found user:", user ? user.email : 'No user');
    console.log("Role:", user ? user.role : 'N/A');
    if (user) {
        console.log("Password:", user.password);
        const match = await user.matchPassword('employee123');
        console.log("Match:", match);
        
        if (!match) {
            console.log("Fixing password...");
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash('employee123', salt);
            await user.save();
            console.log("Password fixed!");
        }
    }
    process.exit(0);
}

check();
