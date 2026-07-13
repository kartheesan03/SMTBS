require('dotenv').config();
const sequelize = require('./src/config/sequelize');
const Employee = require('./src/models/Employee');
const User = require('./src/models/User');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        const employee = await Employee.findById(29);
        console.log('Employee:', { id: employee.id, employeeId: employee.employeeId, contact: employee.contact, userIdField: employee.userIdField });

        const contact = 'karthik.rajan@smtbms.com';
        
        let user = null;
        if (employee.userIdField) {
            user = await User.findById(employee.userIdField);
            console.log('User found by userIdField:', { id: user.id, email: user.email });
        } else if (employee.userId) { // Fallback for some reason?
            user = await User.findById(employee.userId);
            console.log('User found by userId:', { id: user.id, email: user.email });
        } else {
             console.log('No userId on employee');
        }

        // Logic from controller:
        if (!user && contact && contact.includes('@')) {
            console.log('User not found by id, searching by email');
            const existingUser = await User.findOne({ email: contact });
            if (existingUser) {
                user = existingUser;
            } 
        }

        if (user) {
            console.log(`Checking if contact (${contact}) !== user.email (${user.email})`);
            if (contact && contact !== user.email) {
                console.log('Emails are different!');
            }

            const emailExists = await User.findOne({ email: contact });
            console.log('emailExists:', emailExists ? { id: emailExists.id, email: emailExists.email } : 'null');
            
            const empEmailExists = await Employee.findOne({ contact });
            console.log('empEmailExists:', empEmailExists ? { id: empEmailExists.id, contact: empEmailExists.contact } : 'null');
            
            console.log('Condition 1:', (emailExists && String(emailExists.id) !== String(user.id)));
            console.log('Condition 2:', (empEmailExists && String(empEmailExists.id) !== String(employee.id)));
        }

        // Check employee contact logic
        console.log(`Checking if contact (${contact}) !== employee.contact (${employee.contact})`);
        if (contact && contact !== employee.contact) {
            const empEmailExists = await Employee.findOne({ contact });
            console.log('Condition 3:', (empEmailExists && String(empEmailExists.id) !== String(employee.id)));
        }

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        process.exit(0);
    }
})();
