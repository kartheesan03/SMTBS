require('dotenv').config();
const connectDB = require('./src/config/db');
const User = require('./src/models/User');

async function check() {
  await connectDB();
  const users = await User.find({});
  console.log(users.map(u => ({ email: u.email, role: u.role })));
  process.exit(0);
}
check();
