require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('./src/models/User');
const connectDB = require('./src/config/db');

async function test() {
    await connectDB();
    const user = await User.findOne({ email: 'hr@smtbms.com' }); // Test as HR to see filtering
    if (!user) {
        console.log("No user"); return;
    }
    const token = jwt.sign({ id: user.id || user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });

    const navRes = await fetch('http://localhost:5000/api/system/navigation', {
        headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!navRes.ok) {
        console.log("Error status:", navRes.status);
    }
    const navData = await navRes.json();
    console.log("Navigation Length:", navData.length);
    if (navData.length) {
        console.log(navData.map(n => n.title));
    } else {
        console.log(navData); // See what was returned if not array
    }
    process.exit(0);
}
test();
