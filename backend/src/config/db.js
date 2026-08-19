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
        const protectedEmails = new Set(defaultSystemAccounts.map(a => a.email));
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
        const allowedRoles = ['Admin', 'HR', 'Manager', 'Employee', 'Sales'];
        const allUsers = await UserModel.findAll();
        for (const user of allUsers) {
            if (user.role === 'Customer' || user.role === 'Vendor') continue;
            if (!allowedRoles.includes(user.role)) {
                await UserModel.update({ role: 'Employee' }, { where: { id: user.id }, hooks: false });
                console.log(`[Sync] Fixed legacy role for user: ${user.email}`);
            }
        }
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
                if (emp.userIdField !== user.id) {
                    await EmployeeModel.update({ userIdField: user.id }, { where: { id: emp.id } });
                }
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
        const updatedUsers = await UserModel.findAll();
        for (const user of updatedUsers) {
            if (user.role === 'Customer' || user.role === 'Vendor') continue;
            if (protectedEmails.has(user.email)) continue;
            let emp = await EmployeeModel.findOne({ where: { userIdField: user.id } });
            if (!emp && user.email) {
                emp = await EmployeeModel.findOne({ where: { contact: user.email } });
                if (emp && !emp.userIdField) {
                    await EmployeeModel.update({ userIdField: user.id }, { where: { id: emp.id } });
                }
            }
            if (!emp) {
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
        const dialect = sequelize.getDialect();
        
        if (dialect === 'sqlite') {
            await sequelize.query('PRAGMA foreign_keys = OFF;');
        } else if (dialect === 'postgres') {
            await sequelize.query('SET session_replication_role = replica;');
        } else {
            await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
        }

        let tableExists = false;
        if (dialect === 'sqlite') {
            const [rows] = await sequelize.query(`SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}';`);
            tableExists = rows.length > 0;
        } else if (dialect === 'postgres') {
            const [rows] = await sequelize.query(`SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename='${tableName}';`);
            tableExists = rows.length > 0;
        } else {
            const [rows] = await sequelize.query(`SHOW TABLES LIKE '${tableName}';`);
            tableExists = rows.length > 0;
        }

        if (tableExists) {
            const qi = sequelize.getQueryInterface();
            const quote = qi.quoteIdentifier.bind(qi);
            
            let currentCols = [];
            if (dialect === 'sqlite') {
                const [columns] = await sequelize.query(`PRAGMA table_info(${quote(tableName)});`);
                currentCols = columns.map(c => c.name);
            } else if (dialect === 'postgres') {
                const [columns] = await sequelize.query(`SELECT column_name FROM information_schema.columns WHERE table_name='${tableName}';`);
                currentCols = columns.map(c => c.column_name);
            } else {
                const [columns] = await sequelize.query(`SHOW COLUMNS FROM ${quote(tableName)};`);
                currentCols = columns.map(c => c.Field);
            }
            const modelCols = Object.keys(Model.getAttributes());
            const commonCols = currentCols.filter(c => modelCols.includes(c));
            
            await sequelize.query(`DROP TABLE IF EXISTS ${quote(tempTableName)};`);
            await sequelize.query(`ALTER TABLE ${quote(tableName)} RENAME TO ${quote(tempTableName)};`);
            await Model.sync();
            try {
                if (commonCols.length > 0) {
                    const colsStr = commonCols.map(c => quote(c)).join(', ');
                    await sequelize.query(`INSERT INTO ${quote(tableName)} (${colsStr}) SELECT ${colsStr} FROM ${quote(tempTableName)};`);
                }
                await sequelize.query(`DROP TABLE ${quote(tempTableName)};`);
            } catch (copyError) {
                console.error(`Failed to copy data for ${tableName}, restoring original table. Error:`, copyError.message);
                await sequelize.query(`DROP TABLE ${quote(tableName)};`);
                await sequelize.query(`ALTER TABLE ${quote(tempTableName)} RENAME TO ${quote(tableName)};`);
            }
        } else {
            await Model.sync();
        }
        
        if (dialect === 'sqlite') {
            await sequelize.query('PRAGMA foreign_keys = ON;');
        } else if (dialect === 'postgres') {
            await sequelize.query('SET session_replication_role = DEFAULT;');
        } else {
            await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
        }
        console.log(`Successfully recreated table ${tableName} with latest schema.`);
    } catch (error) {
        console.error(`Failed to recreate table ${tableName}:`, error.message);
        const dialect = sequelize.getDialect();
        if (dialect === 'sqlite') {
            await sequelize.query('PRAGMA foreign_keys = ON;');
        } else if (dialect === 'postgres') {
            await sequelize.query('SET session_replication_role = DEFAULT;');
        } else {
            await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
        }
    }
};
const connectDB = async () => {
    try {
        const dialect = sequelize.getDialect();
        const dbName = dialect === 'sqlite' ? 'SQLite' : dialect === 'postgres' ? 'PostgreSQL' : 'MySQL';
        
        console.log(`Target ${dbName} database verified/created.`);
        await sequelize.authenticate();
        console.log(`${dbName} Connection established successfully via Sequelize.`);
        setupAssociations();
            // Removed stale table cleanup code to prevent foreign key errors on startup

        // Safely recreate logic removed as it corrupted SQLite foreign keys
        try {
            await sequelize.sync({ alter: true });
            console.log(`${dbName} Database tables synchronized with alter.`);
        } catch (syncError) {
            console.warn(`[Sync] Alter sync failed, falling back to standard sync: ${syncError.message}`);
            await sequelize.sync();
        }
        
        // Run heavy data sync asynchronously and delay by 15s so we don't block Railway's port binding and healthchecks with CPU-intensive bcrypt hashing
        setTimeout(() => {
            syncAndRepairDatabase().catch(err => console.error('[Sync] Background repair failed:', err));
        }, 15000);
        
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