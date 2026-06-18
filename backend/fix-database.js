/**
 * DATABASE CLEANUP & FIX SCRIPT
 * 
 * Fixes:
 * 1. Remove duplicate Employee records (keeping the original/lowest-id for each contact)
 * 2. Fix admin user role back to Admin
 * 3. Give Karthikeyan Rajan a unique email so it doesn't conflict with admin@smtbms.com
 * 4. Re-link all employees properly
 * 5. Verify all logins work
 */
const sequelize = require('./src/config/sequelize');
require('./src/models/User');
require('./src/models/Employee');
const bcrypt = require('bcryptjs');

const defaultSystemEmails = [
    'admin@smtbms.com',
    'hr@smtbms.com',
    'manager@smtbms.com',
    'employee@smtbms.com',
    'sales@smtbms.com'
];

const defaultAccounts = [
    { email: 'admin@smtbms.com',    password: 'admin123',    role: 'Admin',    name: 'System Admin' },
    { email: 'hr@smtbms.com',       password: 'hr123',       role: 'HR',       name: 'HR Manager' },
    { email: 'manager@smtbms.com',  password: 'manager123',  role: 'Manager',  name: 'Manager' },
    { email: 'employee@smtbms.com', password: 'employee123', role: 'Employee', name: 'System Employee' },
    { email: 'sales@smtbms.com',    password: 'sales123',    role: 'Sales',    name: 'Sales Team' },
];

async function run() {
    try {
        await sequelize.authenticate();
        const UserModel = sequelize.models.User;
        const EmployeeModel = sequelize.models.Employee;
        console.log('✅ Database connected.\n');

        // ============================================================
        // STEP 1: Remove duplicate Employee records
        // ============================================================
        console.log('=== STEP 1: Remove duplicate Employee records ===');
        const [allEmps] = await sequelize.query("SELECT id, employeeId, firstName, lastName, contact, userIdField FROM Employee ORDER BY id;");
        
        // Group by contact email - keep lowest id
        const seenContacts = {};
        const dupeIds = [];
        for (const emp of allEmps) {
            const key = emp.contact;
            if (seenContacts[key]) {
                dupeIds.push(emp.id);
                console.log(`  🗑️ Duplicate: id=${emp.id} empId=${emp.employeeId} ${emp.firstName} ${emp.lastName||''} (${emp.contact}) - keeping id=${seenContacts[key]}`);
            } else {
                seenContacts[key] = emp.id;
            }
        }
        
        if (dupeIds.length > 0) {
            await sequelize.query(`DELETE FROM Employee WHERE id IN (${dupeIds.join(',')});`);
            console.log(`  ✅ Removed ${dupeIds.length} duplicate employee records.`);
        } else {
            console.log('  ✓ No duplicates found.');
        }

        // ============================================================
        // STEP 2: Fix Karthikeyan Rajan - give unique email
        // ============================================================
        console.log('\n=== STEP 2: Fix Employee using admin email ===');
        const [empWithAdmin] = await sequelize.query(
            "SELECT id, employeeId, firstName, lastName, contact FROM Employee WHERE contact='admin@smtbms.com' AND firstName != 'System';"
        );
        
        for (const emp of empWithAdmin) {
            const newEmail = `${emp.firstName.toLowerCase()}.${(emp.lastName || 'user').toLowerCase()}@smtbms.com`;
            console.log(`  🔧 Reassigning ${emp.firstName} ${emp.lastName||''} from admin@smtbms.com -> ${newEmail}`);
            
            // Check if user with new email exists
            const [existingUser] = await sequelize.query(`SELECT id FROM User WHERE email='${newEmail}';`);
            let userId;
            
            if (existingUser.length > 0) {
                userId = existingUser[0].id;
            } else {
                // Create a new user for this employee
                const salt = await bcrypt.genSalt(10);
                const hashed = await bcrypt.hash('password123', salt);
                const [result] = await sequelize.query(
                    `INSERT INTO User (name, email, password, role, active, isProfileComplete, provider, createdAt, updatedAt) 
                     VALUES ('${emp.firstName} ${emp.lastName||''}', '${newEmail}', '${hashed}', 'Employee', 1, 1, 'local', datetime('now'), datetime('now'));`
                );
                // Get the newly created user id
                const [newUser] = await sequelize.query(`SELECT id FROM User WHERE email='${newEmail}';`);
                userId = newUser[0].id;
                console.log(`  ✅ Created new user account: ${newEmail} (id=${userId})`);
            }
            
            // Update the employee record
            await sequelize.query(`UPDATE Employee SET contact='${newEmail}', userIdField=${userId} WHERE id=${emp.id};`);
            console.log(`  ✅ Updated employee ${emp.firstName} to use ${newEmail}`);
        }

        // Also fix employees using other system emails that shouldn't
        const systemEmailEmployees = [
            { sysEmail: 'employee@smtbms.com', sysName: 'System Employee' },
            { sysEmail: 'hr@smtbms.com', sysName: 'HR Manager' },
            { sysEmail: 'sales@smtbms.com', sysName: 'Sales Team' },
        ];

        for (const { sysEmail, sysName } of systemEmailEmployees) {
            const [empsWithSys] = await sequelize.query(
                `SELECT id, firstName, lastName FROM Employee WHERE contact='${sysEmail}' AND firstName != '${sysName.split(' ')[0]}';`
            );
            for (const emp of empsWithSys) {
                const newEmail = `${emp.firstName.toLowerCase()}.${(emp.lastName || 'user').toLowerCase()}@smtbms.com`;
                if (newEmail !== sysEmail) {
                    console.log(`  🔧 Employee ${emp.firstName} using system email ${sysEmail} -> ${newEmail}`);
                    const [existingUser] = await sequelize.query(`SELECT id FROM User WHERE email='${newEmail}';`);
                    let userId;
                    if (existingUser.length > 0) {
                        userId = existingUser[0].id;
                    } else {
                        const salt = await bcrypt.genSalt(10);
                        const hashed = await bcrypt.hash('password123', salt);
                        await sequelize.query(
                            `INSERT INTO User (name, email, password, role, active, isProfileComplete, provider, createdAt, updatedAt) 
                             VALUES ('${emp.firstName} ${emp.lastName||''}', '${newEmail}', '${hashed}', 'Employee', 1, 1, 'local', datetime('now'), datetime('now'));`
                        );
                        const [newUser] = await sequelize.query(`SELECT id FROM User WHERE email='${newEmail}';`);
                        userId = newUser[0].id;
                    }
                    await sequelize.query(`UPDATE Employee SET contact='${newEmail}', userIdField=${userId} WHERE id=${emp.id};`);
                }
            }
        }

        // ============================================================
        // STEP 3: Restore all default system accounts
        // ============================================================
        console.log('\n=== STEP 3: Restore default system accounts ===');
        for (const acct of defaultAccounts) {
            const [users] = await sequelize.query(`SELECT id, name, role, password FROM User WHERE email='${acct.email}';`);
            
            if (users.length === 0) {
                const salt = await bcrypt.genSalt(10);
                const hashed = await bcrypt.hash(acct.password, salt);
                await sequelize.query(
                    `INSERT INTO User (name, email, password, role, active, isProfileComplete, provider, createdAt, updatedAt) 
                     VALUES ('${acct.name}', '${acct.email}', '${hashed}', '${acct.role}', 1, 1, 'local', datetime('now'), datetime('now'));`
                );
                console.log(`  ✅ CREATED: ${acct.email}`);
            } else {
                const user = users[0];
                let needsUpdate = false;
                const updates = {};

                if (user.name !== acct.name) {
                    updates.name = acct.name;
                    needsUpdate = true;
                }
                if (user.role !== acct.role) {
                    updates.role = acct.role;
                    needsUpdate = true;
                }

                // Check password
                const isValidHash = user.password && user.password.startsWith('$2');
                let passwordWorks = false;
                if (isValidHash) {
                    passwordWorks = await bcrypt.compare(acct.password, user.password);
                }
                if (!passwordWorks) {
                    const salt = await bcrypt.genSalt(10);
                    updates.password = await bcrypt.hash(acct.password, salt);
                    needsUpdate = true;
                }

                if (needsUpdate) {
                    const setClauses = Object.entries(updates).map(([k, v]) => `${k}='${v}'`).join(', ');
                    await sequelize.query(`UPDATE User SET ${setClauses}, updatedAt=datetime('now') WHERE id=${user.id};`);
                    console.log(`  🔧 FIXED: ${acct.email} (${Object.keys(updates).join(', ')})`);
                } else {
                    console.log(`  ✓ OK: ${acct.email}`);
                }
            }
        }

        // ============================================================
        // STEP 4: Re-link remaining employees
        // ============================================================
        console.log('\n=== STEP 4: Link employees to users ===');
        const [remaining] = await sequelize.query("SELECT id, firstName, lastName, contact, userIdField FROM Employee;");
        for (const emp of remaining) {
            if (emp.contact && emp.contact.includes('@')) {
                const [users] = await sequelize.query(`SELECT id FROM User WHERE email='${emp.contact}';`);
                if (users.length > 0 && emp.userIdField !== users[0].id) {
                    await sequelize.query(`UPDATE Employee SET userIdField=${users[0].id} WHERE id=${emp.id};`);
                    console.log(`  🔗 Linked: ${emp.firstName} ${emp.lastName||''} -> userId=${users[0].id}`);
                }
            }
        }

        // ============================================================
        // STEP 5: Verify
        // ============================================================
        console.log('\n=== STEP 5: Verification ===');
        for (const acct of defaultAccounts) {
            const [users] = await sequelize.query(`SELECT id, name, role, password FROM User WHERE email='${acct.email}';`);
            if (users.length === 0) {
                console.log(`  ❌ FAIL: ${acct.email} NOT FOUND`);
                continue;
            }
            const user = users[0];
            const match = await bcrypt.compare(acct.password, user.password);
            console.log(`  ${match ? '✅' : '❌'} ${acct.email} / ${acct.password} -> role=${user.role} name=${user.name} login=${match ? 'PASS' : 'FAIL'}`);
        }

        // Show final state
        console.log('\n=== FINAL STATE ===');
        const [finalUsers] = await sequelize.query("SELECT id, email, role, name FROM User ORDER BY id;");
        console.log('Users:');
        finalUsers.forEach(u => console.log(`  id=${u.id} ${u.email} role=${u.role} name=${u.name}`));
        
        const [finalEmps] = await sequelize.query("SELECT id, employeeId, firstName, lastName, department, contact, userIdField FROM Employee ORDER BY id;");
        console.log('\nEmployees:');
        finalEmps.forEach(e => console.log(`  id=${e.id} ${e.employeeId} ${e.firstName} ${e.lastName||''} dept=${e.department} contact=${e.contact} userId=${e.userIdField}`));

    } catch (error) {
        console.error('❌ Error:', error);
    }
    process.exit(0);
}

run();
