const sequelize = require('./src/config/sequelize');
const UserModel = require('./src/models/User').sequelizeModel;
const EmployeeModel = require('./src/models/Employee').sequelizeModel;
const bcrypt = require('bcryptjs');

const defaultAccounts = [
    { email: 'admin@smtbms.com',    password: 'admin123',    role: 'Admin',    name: 'System Admin' },
    { email: 'hr@smtbms.com',       password: 'hr123',       role: 'HR',       name: 'HR Manager' },
    { email: 'manager@smtbms.com',  password: 'manager123',  role: 'Manager',  name: 'Manager' },
    { email: 'employee@smtbms.com', password: 'employee123', role: 'Employee', name: 'System Employee' },
    { email: 'sales@smtbms.com',    password: 'sales123',    role: 'Sales',    name: 'Sales Team' },
];

async function generateUniqueEmployeeId() {
    const [emps] = await sequelize.query("SELECT employeeId FROM Employee;");
    const ids = emps.map(e => {
        const match = e.employeeId.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
    });
    const maxVal = ids.length > 0 ? Math.max(...ids) : 0;
    return `EMP${String(maxVal + 1).padStart(3, '0')}`;
}

async function run() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected.\n');

        let usersRepaired = 0;
        let employeesRepaired = 0;
        let missingEmployeesRecreated = 0;
        let missingUsersRecreated = 0;
        let duplicateEmailsFixed = 0;
        let passwordsReHashed = 0;

        // ============================================================
        // STEP 1: Recover all default login accounts (Req 1 & 13)
        // ============================================================
        console.log('=== STEP 1: Recovering Default Login Accounts ===');
        for (const acct of defaultAccounts) {
            let user = await UserModel.findOne({ where: { email: acct.email } });

            if (!user) {
                const salt = await bcrypt.genSalt(10);
                const hashed = await bcrypt.hash(acct.password, salt);
                user = await UserModel.create({
                    name: acct.name,
                    email: acct.email,
                    password: hashed,
                    role: acct.role,
                    active: true,
                    isProfileComplete: true
                }, { hooks: false });
                console.log(`  [CREATED] Default user: ${acct.email}`);
                missingUsersRecreated++;
            } else {
                let updated = false;
                if (user.role !== acct.role) {
                    user.role = acct.role;
                    updated = true;
                }
                if (user.name !== acct.name) {
                    user.name = acct.name;
                    updated = true;
                }

                // Verify and reset password if incorrect or not hashed
                const isValidHash = user.password && user.password.startsWith('$2');
                let passwordWorks = false;
                if (isValidHash) {
                    passwordWorks = await bcrypt.compare(acct.password, user.password);
                }

                if (!passwordWorks) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(acct.password, salt);
                    updated = true;
                    passwordsReHashed++;
                    console.log(`  [RESET PASSWORD] For: ${acct.email}`);
                }

                if (updated) {
                    await UserModel.update(
                        { name: user.name, role: user.role, password: user.password },
                        { where: { id: user.id }, hooks: false }
                    );
                    console.log(`  [REPAIRED] Default user attributes: ${acct.email}`);
                    usersRepaired++;
                }
            }
        }

        // ============================================================
        // STEP 2: Harmonize User Roles (Req 9)
        // ============================================================
        console.log('\n=== STEP 2: Harmonizing User Roles ===');
        const allowedRoles = ['Admin', 'HR', 'Manager', 'Employee', 'Sales'];
        const allUsers = await UserModel.findAll();
        for (const user of allUsers) {
            if (user.role === 'Customer' || user.role === 'Vendor') {
                continue; // Preserve customer and vendor roles
            }
            if (!allowedRoles.includes(user.role)) {
                console.log(`  [WARN] User ${user.email} has legacy/invalid role '${user.role}'`);
                user.role = 'Employee'; // Default to Employee role
                await UserModel.update({ role: 'Employee' }, { where: { id: user.id }, hooks: false });
                console.log(`  [REPAIRED] Set role to 'Employee' for: ${user.email}`);
                usersRepaired++;
            }
        }

        // ============================================================
        // STEP 3: Link & Synchronize Employee and User Records (Req 3, 4, 8)
        // ============================================================
        console.log('\n=== STEP 3: Synchronizing Employee and User Links ===');
        const allEmployees = await EmployeeModel.findAll();
        for (const emp of allEmployees) {
            let user = null;

            // Find matching user by contact email
            if (emp.contact && emp.contact.includes('@')) {
                user = await UserModel.findOne({ where: { email: emp.contact } });
            }

            if (!user && emp.userIdField) {
                // If not found by email, try finding by userIdField
                user = await UserModel.findByPk(emp.userIdField);
            }

            if (user) {
                // Found User -> update Employee's userIdField if mismatched
                if (emp.userIdField !== user.id) {
                    await EmployeeModel.update({ userIdField: user.id }, { where: { id: emp.id } });
                    console.log(`  [LINKED] Employee ${emp.firstName} ${emp.lastName || ''} -> User ${user.email}`);
                    employeesRepaired++;
                }

                // Synchronize attributes User ↔ Employee
                let userUpdated = false;
                const empFullName = `${emp.firstName} ${emp.lastName || ''}`.trim();
                
                if (user.name !== empFullName) {
                    user.name = empFullName;
                    userUpdated = true;
                }
                if (user.email !== emp.contact) {
                    user.email = emp.contact;
                    userUpdated = true;
                }
                if (user.role !== emp.department) {
                    if (allowedRoles.includes(emp.department)) {
                        user.role = emp.department;
                        userUpdated = true;
                    } else {
                        // Reset mismatched/invalid department to Employee
                        await EmployeeModel.update({ department: 'Employee' }, { where: { id: emp.id } });
                        employeesRepaired++;
                        user.role = 'Employee';
                        userUpdated = true;
                    }
                }

                if (userUpdated) {
                    await UserModel.update(
                        { name: user.name, email: user.email, role: user.role },
                        { where: { id: user.id }, hooks: false }
                    );
                    console.log(`  [SYNCED] Attributes for User: ${user.email}`);
                    usersRepaired++;
                }
            } else {
                // No User exists -> Recreate User (Req 8)
                const salt = await bcrypt.genSalt(10);
                const hashed = await bcrypt.hash('password123', salt);
                const finalEmail = emp.contact && emp.contact.includes('@') 
                    ? emp.contact 
                    : `${emp.firstName.toLowerCase()}.${(emp.lastName || 'user').toLowerCase()}@smtbms.com`;
                
                const userRole = allowedRoles.includes(emp.department) ? emp.department : 'Employee';

                const newUser = await UserModel.create({
                    name: `${emp.firstName} ${emp.lastName || ''}`.trim(),
                    email: finalEmail,
                    password: hashed,
                    role: userRole,
                    active: true,
                    isProfileComplete: true
                }, { hooks: false });

                await EmployeeModel.update(
                    { userIdField: newUser.id, contact: finalEmail },
                    { where: { id: emp.id } }
                );

                console.log(`  [RECREATED USER] For Employee ${emp.firstName} ${emp.lastName || ''}: ${finalEmail}`);
                missingUsersRecreated++;
            }
        }

        // ============================================================
        // STEP 4: Recreate Missing Employees (Req 7)
        // ============================================================
        console.log('\n=== STEP 4: Recreating Missing Employees ===');
        const updatedUsers = await UserModel.findAll();
        for (const user of updatedUsers) {
            if (user.role === 'Customer' || user.role === 'Vendor') {
                continue;
            }

            const emp = await EmployeeModel.findOne({ where: { userIdField: user.id } });
            if (!emp) {
                // Employee record is missing -> Recreate it
                const empId = await generateUniqueEmployeeId();
                const nameParts = user.name.split(' ');
                const firstName = nameParts[0] || 'System';
                const lastName = nameParts.slice(1).join(' ') || '';

                await EmployeeModel.create({
                    userIdField: user.id,
                    employeeId: empId,
                    firstName: firstName,
                    lastName: lastName,
                    department: allowedRoles.includes(user.role) ? user.role : 'Employee',
                    designation: user.role + ' Staff',
                    contact: user.email,
                    phone: user.phone || '0000000000',
                    address: 'Office HQ',
                    joinDate: user.createdAt || new Date()
                });

                console.log(`  [RECREATED EMPLOYEE] For User: ${user.email} (Emp ID: ${empId})`);
                missingEmployeesRecreated++;
            }
        }

        // ============================================================
        // STEP 5: Validate and Ensure Hashed Passwords (Req 2)
        // ============================================================
        console.log('\n=== STEP 5: Ensuring All Passwords Are Securely Hashed ===');
        const checkUsers = await UserModel.findAll();
        for (const u of checkUsers) {
            if (!u.password) continue;
            if (!u.password.startsWith('$2')) {
                const salt = await bcrypt.genSalt(10);
                const hashed = await bcrypt.hash(u.password, salt);
                await UserModel.update({ password: hashed }, { where: { id: u.id }, hooks: false });
                console.log(`  [HASHED PLAIN PASSWORD] For user: ${u.email}`);
                passwordsReHashed++;
            }
        }

        // ============================================================
        // STEP 6: Final Verification - Test Logins (Req 10)
        // ============================================================
        console.log('\n=== STEP 6: Verification - Testing Login for Default Accounts ===');
        const loginStatus = {};
        for (const acct of defaultAccounts) {
            const user = await UserModel.findOne({ where: { email: acct.email } });
            if (!user) {
                loginStatus[acct.role] = 'FAIL (User not found)';
                continue;
            }
            const match = await bcrypt.compare(acct.password, user.password);
            loginStatus[acct.role] = match ? 'SUCCESS' : 'FAIL (Password mismatch)';
        }

        console.log('\n==================================================');
        console.log('                  REPAIR REPORT                   ');
        console.log('==================================================');
        console.log(`  Users Repaired:             ${usersRepaired}`);
        console.log(`  Employees Repaired:         ${employeesRepaired}`);
        console.log(`  Missing Employees Recreated: ${missingEmployeesRecreated}`);
        console.log(`  Missing Users Recreated:     ${missingUsersRecreated}`);
        console.log(`  Duplicate Emails Fixed:     ${duplicateEmailsFixed}`);
        console.log(`  Passwords Re-hashed:        ${passwordsReHashed}`);
        console.log('--------------------------------------------------');
        console.log('  Login Status Verification:');
        Object.entries(loginStatus).forEach(([role, status]) => {
            console.log(`    - ${role.padEnd(10)}: ${status}`);
        });
        console.log('==================================================\n');

    } catch (error) {
        console.error('❌ Error during database repair:', error);
    }
    process.exit(0);
}

run();
