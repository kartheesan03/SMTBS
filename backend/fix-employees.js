require('dotenv').config();
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const Employee = require('./src/models/Employee');

async function fixMissingEmployees() {
    await connectDB();
    const users = await User.find({});
    let count = 0;
    
    for (const user of users) {
        if (['Admin', 'HR', 'Manager', 'Employee', 'Sales'].includes(user.role)) {
            // Check if Employee exists
            const emp = await Employee.findOne({ userIdField: user.id || user._id });
            const emailEmp = await Employee.findOne({ contact: user.email });
            
            if (!emp && !emailEmp) {
                // Split name
                const parts = (user.name || '').split(' ');
                const firstName = parts[0] || 'Unknown';
                const lastName = parts.slice(1).join(' ') || '';
                
                // Generate employee ID
                const employeeId = 'EMP' + Math.floor(Math.random() * 900000 + 100000);
                
                await Employee.create({
                    userIdField: user.id || user._id,
                    employeeId,
                    firstName,
                    lastName,
                    department: user.role,
                    designation: user.role,
                    contact: user.email,
                    joinDate: new Date()
                });
                console.log(`Created employee for ${user.email}`);
                count++;
            }
        }
    }
    console.log(`Fixed ${count} missing employees.`);
    process.exit(0);
}

fixMissingEmployees().catch(console.error);
