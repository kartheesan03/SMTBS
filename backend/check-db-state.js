const seq = require('./src/config/sequelize');
require('./src/models/User');
require('./src/models/Employee');
require('./src/models/associations');

(async () => {
    await seq.authenticate();
    
    // Check table columns
    const [cols] = await seq.query("PRAGMA table_info('Employee');");
    console.log('=== Employee Columns ===');
    cols.forEach(c => console.log('  ' + c.name + ' (' + c.type + ')'));
    
    // Check raw data with userIdField
    const [rows] = await seq.query("SELECT id, employeeId, firstName, lastName, department, contact, userIdField FROM Employee;");
    console.log('\n=== Employee Data (Raw SQL) ===');
    rows.forEach(r => {
        console.log('  id=' + r.id + ' empId=' + r.employeeId + ' name=' + r.firstName + ' ' + (r.lastName || '') + ' dept=' + r.department + ' contact=' + r.contact + ' userId=' + r.userIdField);
    });
    
    // Check admin user role
    const [adminUser] = await seq.query("SELECT id, email, role, name FROM User WHERE email='admin@smtbms.com';");
    console.log('\n=== Admin User ===');
    console.log(adminUser);
    
    // Test login with bcrypt
    const bcrypt = require('bcryptjs');
    const [adminPw] = await seq.query("SELECT password FROM User WHERE email='admin@smtbms.com';");
    if (adminPw.length > 0) {
        const match = await bcrypt.compare('admin123', adminPw[0].password);
        console.log('admin123 password match:', match);
    }
    
    process.exit(0);
})();
