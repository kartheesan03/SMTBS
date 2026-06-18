/**
 * COMPREHENSIVE USER SYNC SCRIPT
 * 
 * This script ensures every role in the system has a valid, working login.
 * It checks:
 * 1. All default system accounts exist and have properly hashed passwords
 * 2. Every Employee record has a linked User account with a valid hashed password
 * 3. Every User password is actually a bcrypt hash (not plain text)
 * 4. Employee.userIdField is properly linked to User.id
 * 5. Employee.contact holds a valid email (not a phone number)
 */

const sequelize = require('./src/config/sequelize');
const UserModel = require('./src/models/User').sequelizeModel;
const EmployeeModel = require('./src/models/Employee').sequelizeModel;
const bcrypt = require('bcryptjs');

// Default system accounts that MUST exist
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
        console.log('✅ Database connected.\n');

        let totalFixed = 0;

        // ============================================================
        // STEP 1: Ensure all default accounts exist with valid passwords
        // ============================================================
        console.log('=== STEP 1: Checking default system accounts ===');
        for (const acct of defaultAccounts) {
            let user = await UserModel.findOne({ where: { email: acct.email } });

            if (!user) {
                // Create missing user
                user = await UserModel.create({
                    name: acct.name,
                    email: acct.email,
                    password: acct.password, // Let beforeSave hook handle hashing
                    role: acct.role,
                    active: true,
                    isProfileComplete: true
                });
                console.log(`  ✅ CREATED missing account: ${acct.email} (${acct.role})`);
                totalFixed++;
            } else {
                // Verify the password is a valid bcrypt hash AND matches the expected password
                const isValidHash = user.password && user.password.startsWith('$2');
                let passwordWorks = false;
                if (isValidHash) {
                    passwordWorks = await bcrypt.compare(acct.password, user.password);
                }

                if (!passwordWorks) {
                    // Re-hash the password directly (bypass hooks to avoid double-hashing)
                    const salt = await bcrypt.genSalt(10);
                    const hashed = await bcrypt.hash(acct.password, salt);
                    await UserModel.update(
                        { password: hashed },
                        { where: { id: user.id }, hooks: false }
                    );
                    console.log(`  🔧 FIXED password for: ${acct.email} (was ${isValidHash ? 'wrong hash' : 'plain text/corrupted'})`);
                    totalFixed++;
                } else {
                    console.log(`  ✓ OK: ${acct.email} - password works`);
                }
            }
        }

        // ============================================================
        // STEP 2: Check ALL User passwords are valid bcrypt hashes
        // ============================================================
        console.log('\n=== STEP 2: Checking all User passwords are valid bcrypt hashes ===');
        const allUsers = await UserModel.findAll();
        for (const user of allUsers) {
            if (!user.password) {
                // Google-only users may not have a password - skip
                if (user.provider === 'google' || user.googleId) {
                    console.log(`  ✓ SKIP (Google user): ${user.email}`);
                    continue;
                }
                // Non-google user with no password - set a default
                const salt = await bcrypt.genSalt(10);
                const hashed = await bcrypt.hash('password123', salt);
                await UserModel.update(
                    { password: hashed },
                    { where: { id: user.id }, hooks: false }
                );
                console.log(`  🔧 FIXED: ${user.email} - had NO password, set to 'password123'`);
                totalFixed++;
                continue;
            }

            const isValidHash = user.password.startsWith('$2');
            if (!isValidHash) {
                // Password is stored as plain text - hash it
                const salt = await bcrypt.genSalt(10);
                const hashed = await bcrypt.hash(user.password, salt);
                await UserModel.update(
                    { password: hashed },
                    { where: { id: user.id }, hooks: false }
                );
                console.log(`  🔧 FIXED: ${user.email} - plain text password was hashed`);
                totalFixed++;
            } else {
                console.log(`  ✓ OK: ${user.email} - valid bcrypt hash`);
            }
        }

        // ============================================================
        // STEP 3: Link every Employee to a User account
        // ============================================================
        console.log('\n=== STEP 3: Linking Employee records to User accounts ===');
        const allEmployees = await EmployeeModel.findAll();
        for (const emp of allEmployees) {
            const empName = `${emp.firstName} ${emp.lastName || ''}`.trim();
            let user = null;

            // Check if already linked
            if (emp.userIdField) {
                user = await UserModel.findByPk(emp.userIdField);
                if (user) {
                    console.log(`  ✓ OK: ${empName} -> linked to ${user.email}`);
                    continue;
                } else {
                    console.log(`  ⚠ ${empName} has userIdField=${emp.userIdField} but User not found`);
                }
            }

            // Not linked - find or create a User
            let email = null;
            if (emp.contact && emp.contact.includes('@')) {
                email = emp.contact;
            } else {
                // Contact is a phone number, not an email. Generate one.
                email = `${emp.firstName.toLowerCase()}${emp.lastName ? '.' + emp.lastName.toLowerCase() : ''}@smtbms.com`;
                // Move phone number out of contact field
                if (emp.contact && !emp.phone) {
                    await EmployeeModel.update(
                        { phone: emp.contact },
                        { where: { id: emp.id } }
                    );
                }
            }

            // Find existing user by email
            user = await UserModel.findOne({ where: { email: email } });
            if (!user) {
                // Create a new user account
                const salt = await bcrypt.genSalt(10);
                const hashed = await bcrypt.hash('password123', salt);
                user = await UserModel.create({
                    name: empName,
                    email: email,
                    password: hashed,
                    role: emp.department || 'Employee',
                    active: true,
                    isProfileComplete: true
                });
                console.log(`  ✅ CREATED User account for ${empName}: ${email} / password123`);
                totalFixed++;
            } else {
                console.log(`  🔗 Found existing user for ${empName}: ${email}`);
            }

            // Link employee to user
            await EmployeeModel.update(
                { userIdField: user.id, contact: email },
                { where: { id: emp.id } }
            );
            console.log(`  🔗 LINKED: Employee ${empName} -> User ${user.email} (id: ${user.id})`);
            totalFixed++;
        }

        // ============================================================
        // STEP 4: Final Verification - Test all logins
        // ============================================================
        console.log('\n=== STEP 4: Verification - Testing all default logins ===');
        for (const acct of defaultAccounts) {
            const user = await UserModel.findOne({ where: { email: acct.email } });
            if (!user) {
                console.log(`  ❌ FAIL: ${acct.email} - User NOT FOUND!`);
                continue;
            }
            const match = await bcrypt.compare(acct.password, user.password);
            if (match) {
                console.log(`  ✅ PASS: ${acct.email} / ${acct.password} -> login works!`);
            } else {
                console.log(`  ❌ FAIL: ${acct.email} / ${acct.password} -> password mismatch!`);
            }
        }

        // ============================================================
        // Summary
        // ============================================================
        console.log(`\n${'='.repeat(50)}`);
        console.log(`SYNC COMPLETE. Total fixes applied: ${totalFixed}`);
        console.log(`${'='.repeat(50)}`);
        console.log('\nDefault login credentials:');
        defaultAccounts.forEach(a => console.log(`  ${a.role.padEnd(10)} -> ${a.email.padEnd(25)} / ${a.password}`));
        console.log('\nAll other employees have password: password123');

    } catch (error) {
        console.error('❌ Error:', error);
    }
    process.exit(0);
}

run();
