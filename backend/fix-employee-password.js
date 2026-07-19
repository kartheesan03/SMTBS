const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
require('dotenv').config();

async function fix() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smtbms');
    const user = await User.findOne({ email: 'employee@smtbms.com' });
    if (!user) {
        console.log("USER NOT FOUND");
        process.exit(1);
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('employee123', salt);
    
    user.password = hashedPassword;
    await user.save();
    
    console.log("PASSWORD UPDATED TO HASHED employee123");
    process.exit(0);
}

fix();
