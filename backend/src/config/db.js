const sequelize = require('./sequelize');
const setupAssociations = require('../models/associations');
const bcrypt = require('bcryptjs');

const defaultSystemAccounts = [
    { email: 'admin@smtbms.com',    password: 'admin123',    role: 'Admin',    name: 'System Admin' },
    { email: 'hr@smtbms.com',       password: 'hr123',       role: 'HR',       name: 'HR Manager' },
    { email: 'manager@smtbms.com',  password: 'manager123',  role: 'Manager',  name: 'Manager' },
    { email: 'employee@smtbms.com', password: 'employee123', role: 'Employee', name: 'System Employee' },
    { email: 'sales@smtbms.com',    password: 'sales123',    role: 'Sales',    name: 'Sales Team' },
];

const syncAndRepairDatabase = async () => {
    try {
        const UserModel = sequelize.models.User;
        const EmployeeModel = sequelize.models.Employee;
        if (!UserModel || !EmployeeModel) return;

        const defaultSystemAccounts = [
            { email: 'admin@smtbms.com',    password: 'admin123',    role: 'Admin',    name: 'System Admin' },
            { email: 'hr@smtbms.com',       password: 'hr123',       role: 'HR',       name: 'HR Manager' },
            { email: 'manager@smtbms.com',  password: 'manager123',  role: 'Manager',  name: 'Manager' },
            { email: 'employee@smtbms.com', password: 'employee123', role: 'Employee', name: 'System Employee' },
            { email: 'sales@smtbms.com',    password: 'sales123',    role: 'Sales',    name: 'Sales Team' },
        ];

        // Build a set of protected system emails — these must NEVER be overwritten by employee sync
        const protectedEmails = new Set(defaultSystemAccounts.map(a => a.email));

        // STEP 1: Ensure default users exist and passwords match
        for (const acct of defaultSystemAccounts) {
            let user = await UserModel.findOne({ where: { email: acct.email } });

            if (!user) {
                const salt = await bcrypt.genSalt(10);
                const hashed = await bcrypt.hash(acct.password, salt);
                await UserModel.create({
                    name: acct.name,
                    email: acct.email,
                    password: hashed,
                    role: acct.role,
                    active: true,
                    isProfileComplete: true
                }, { hooks: false });
                console.log(`[Sync] Created default account: ${acct.email}`);
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

                const isValidHash = user.password && user.password.startsWith('$2');
                let passwordWorks = false;
                if (isValidHash) {
                    passwordWorks = await bcrypt.compare(acct.password, user.password);
                }
                if (!passwordWorks) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(acct.password, salt);
                    updated = true;
                }
                if (updated) {
                    await UserModel.update(
                        { name: user.name, role: user.role, password: user.password },
                        { where: { id: user.id }, hooks: false }
                    );
                    console.log(`[Sync] Restored/fixed default user credentials: ${acct.email}`);
                }
            }
        }

        // STEP 2: Harmonize user roles
        const allowedRoles = ['Admin', 'HR', 'Manager', 'Employee', 'Sales'];
        const allUsers = await UserModel.findAll();
        for (const user of allUsers) {
            if (user.role === 'Customer' || user.role === 'Vendor') continue;
            if (!allowedRoles.includes(user.role)) {
                await UserModel.update({ role: 'Employee' }, { where: { id: user.id }, hooks: false });
                console.log(`[Sync] Fixed legacy role for user: ${user.email}`);
            }
        }

        // STEP 3: Repair Employee ↔ User linkages
        // IMPORTANT: Skip syncing user attributes for system/protected accounts
        const allEmployees = await EmployeeModel.findAll();
        for (const emp of allEmployees) {
            let user = null;
            if (emp.contact && emp.contact.includes('@')) {
                user = await UserModel.findOne({ where: { email: emp.contact } });
            }
            if (!user && emp.userIdField) {
                user = await UserModel.findByPk(emp.userIdField);
            }

            if (user) {
                // Link employee to user if not already linked
                if (emp.userIdField !== user.id) {
                    await EmployeeModel.update({ userIdField: user.id }, { where: { id: emp.id } });
                }

                // Only sync user attributes if the user is NOT a protected system account
                if (!protectedEmails.has(user.email)) {
                    let userUpdated = false;
                    const empFullName = `${emp.firstName} ${emp.lastName || ''}`.trim();
                    if (user.name !== empFullName) {
                        user.name = empFullName;
                        userUpdated = true;
                    }
                    if (user.email !== emp.contact && emp.contact && emp.contact.includes('@') && !protectedEmails.has(emp.contact)) {
                        user.email = emp.contact;
                        userUpdated = true;
                    }
                    if (user.role !== emp.department) {
                        if (allowedRoles.includes(emp.department)) {
                            user.role = emp.department;
                            userUpdated = true;
                        } else {
                            await EmployeeModel.update({ department: 'Employee' }, { where: { id: emp.id } });
                            user.role = 'Employee';
                            userUpdated = true;
                        }
                    }
                    if (userUpdated) {
                        await UserModel.update(
                            { name: user.name, email: user.email, role: user.role },
                            { where: { id: user.id }, hooks: false }
                        );
                    }
                }
            } else {
                // Recreate user if missing
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
                console.log(`[Sync] Recreated missing User for Employee: ${finalEmail}`);
            }
        }

        // STEP 4: Create missing Employees for existing Users (avoid duplicates)
        const updatedUsers = await UserModel.findAll();
        for (const user of updatedUsers) {
            if (user.role === 'Customer' || user.role === 'Vendor') continue;
            
            // Check by userIdField first, then by contact email to avoid duplicates
            let emp = await EmployeeModel.findOne({ where: { userIdField: user.id } });
            if (!emp && user.email) {
                emp = await EmployeeModel.findOne({ where: { contact: user.email } });
                if (emp && !emp.userIdField) {
                    // Found by email but not linked — link it
                    await EmployeeModel.update({ userIdField: user.id }, { where: { id: emp.id } });
                }
            }
            
            if (!emp) {
                // Generate a unique employee ID
                const [emps] = await sequelize.query("SELECT employeeId FROM Employee;");
                const ids = emps.map(e => {
                    const match = e.employeeId.match(/\d+/);
                    return match ? parseInt(match[0], 10) : 0;
                });
                const maxVal = ids.length > 0 ? Math.max(...ids) : 0;
                const empId = `EMP${String(maxVal + 1).padStart(3, '0')}`;

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
                console.log(`[Sync] Created missing Employee for User: ${user.email}`);
            }
        }

        // STEP 5: Ensure all remaining user passwords are valid hashes
        const checkUsers = await UserModel.findAll();
        for (const u of checkUsers) {
            if (u.password && !u.password.startsWith('$2')) {
                const salt = await bcrypt.genSalt(10);
                const hashed = await bcrypt.hash(u.password, salt);
                await UserModel.update({ password: hashed }, { where: { id: u.id }, hooks: false });
            }
        }
        console.log('[Sync] Database synchronization & repair complete.');
    } catch (error) {
        console.error('[Sync] Error during database sync:', error.message);
    }
};

const safelyRecreateTable = async (modelName) => {
    const Model = sequelize.models[modelName];
    if (!Model) return;

    const tableName = Model.tableName;
    const tempTableName = `${tableName}_temp_migration`;

    try {
        console.log(`Safely recreating table ${tableName}...`);
        // Disable foreign keys temporarily
        await sequelize.query('PRAGMA foreign_keys = OFF;');

        // Check if table exists
        const [tableExists] = await sequelize.query(`SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}';`);
        
        if (tableExists.length > 0) {
            // Get current columns
            const [columns] = await sequelize.query(`PRAGMA table_info('${tableName}');`);
            const currentCols = columns.map(c => c.name);
            
            // Get model columns
            const modelCols = Object.keys(Model.getAttributes());
            
            // Find common columns
            const commonCols = currentCols.filter(c => modelCols.includes(c));
            
            // Create temp table with data
            await sequelize.query(`DROP TABLE IF EXISTS "${tempTableName}";`);
            await sequelize.query(`CREATE TABLE "${tempTableName}" AS SELECT * FROM "${tableName}";`);
            
            // Drop original table
            await sequelize.query(`DROP TABLE "${tableName}";`);
            
            // Recreate table with new schema
            await Model.sync();
            
            // Copy data back
            if (commonCols.length > 0) {
                const colsStr = commonCols.map(c => `"${c}"`).join(', ');
                await sequelize.query(`INSERT INTO "${tableName}" (${colsStr}) SELECT ${colsStr} FROM "${tempTableName}";`);
            }
            
            // Drop temp table
            await sequelize.query(`DROP TABLE "${tempTableName}";`);
        } else {
            // Just sync if it doesn't exist
            await Model.sync();
        }

        // Re-enable foreign keys
        await sequelize.query('PRAGMA foreign_keys = ON;');
        console.log(`Successfully recreated table ${tableName} with latest schema.`);
    } catch (error) {
        console.error(`Failed to recreate table ${tableName}:`, error.message);
        await sequelize.query('PRAGMA foreign_keys = ON;');
    }
};

const connectDB = async () => {
    try {
        console.log('Target SQLite database verified/created.');

        // Authenticate database connection
        await sequelize.authenticate();
        console.log('SQLite Connection established successfully via Sequelize.');

        // Establish structural associations between tables
        setupAssociations();

        // 1. Remove any stale backup tables
        try {
            const [tables] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND (name LIKE '%_backup' OR name LIKE '%_temp_migration');");
            for (let row of tables) {
                await sequelize.query(`DROP TABLE IF EXISTS "${row.name}";`);
                console.log(`Dropped stale table: ${row.name}`);
            }
        } catch (e) {
            console.log('Error cleaning up stale tables:', e.message);
        }

        // 2. Safely recreate User table to apply schema changes without alter: true bugs
        // Ensure this runs gracefully
        await safelyRecreateTable('User');
        await safelyRecreateTable('Notification');
        await safelyRecreateTable('Material');

        // 3. Synchronize Sequelize schemas with database safely (without alter: true)
        await sequelize.sync();
        console.log('SQLite Database tables synchronized.');
        
        // 4. Ensure default system accounts always exist with valid passwords
        await syncAndRepairDatabase();
        
        return true;
    } catch (error) {
        console.error('\n******************************************************************************');
        console.error('  DATABASE CONNECTION / MIGRATION ERROR:');
        console.error(`  Message: ${error.message}`);
        if (error.errors) {
            console.error('  Validation Details:', JSON.stringify(error.errors, null, 2));
        }
        console.error(`  Stack: ${error.stack}`);
        console.error('******************************************************************************\n');
        return false;
    }
};

module.exports = connectDB;