const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function test() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smtbms');
    const user = await User.findOne({ email: 'employee@smtbms.com' });
    if (!user) {
        console.log("USER NOT FOUND");
        process.exit(1);
    }
    console.log("USER FOUND:", user.email, user.role);
    console.log("PASSWORD HASH:", user.password);
    const isMatch = await user.matchPassword('employee123');
    console.log("PASSWORD MATCH:", isMatch);
    process.exit(0);
}

test();
