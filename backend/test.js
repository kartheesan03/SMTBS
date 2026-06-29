require('dotenv').config();
const connectDB = require('./src/config/db');
const Role = require('./src/models/Role');
const User = require('./src/models/User');

async function test() {
    await connectDB();
    const roles = await Role.find({});
    console.log("Roles found:", roles.length);
    roles.forEach(r => console.log(r.name, r.permissions?.length));
    
    const users = await User.find({});
    console.log("Users found:", users.length);
    users.forEach(u => console.log(u.email, u.role));
    
    process.exit(0);
}
test();
