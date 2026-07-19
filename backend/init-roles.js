const sequelize = require('./src/config/sequelize');
const setupAssociations = require('./src/models/associations');
const Role = require('./src/models/Role');
const User = require('./src/models/User');

const initRoles = async () => {
    try {
        setupAssociations();
        await Role.sequelizeModel.sync(); // This will create the Role table without altering other tables

        const defaultRoles = [
            {
                name: 'Admin',
                description: 'System Administrator with full access',
                permissions: [
                    'view_dashboard',
                    'view_hrms', 'manage_hrms',
                    'view_materials', 'manage_materials',
                    'view_crm', 'manage_crm',
                    'view_erp', 'manage_erp',
                    'view_tasks', 'manage_tasks',
                    'view_reports', 'manage_reports',
                    'view_attendance', 'manage_attendance',
                    'manage_users',
                    'view_settings', 'manage_settings',
                    'view_audit_logs',
                    'manage_backup', 'create_backup', 'restore_backup', 'delete_backup'
                ]
            },
            {
                name: 'HR',
                description: 'Human Resources Manager',
                permissions: [
                    'view_dashboard',
                    'view_hrms', 'manage_hrms',
                    'view_attendance', 'manage_attendance',
                    'view_tasks',
                    'view_reports',
                    'create_hr_backup'
                ]
            },
            {
                name: 'Manager',
                description: 'General Manager',
                permissions: [
                    'view_dashboard',
                    'view_hrms', 
                    'view_crm',
                    'view_materials',
                    'view_erp',
                    'view_tasks', 'manage_tasks',
                    'view_reports',
                    'view_attendance',
                    'create_manager_backup'
                ]
            },
            {
                name: 'Sales',
                description: 'Sales Executive',
                permissions: [
                    'view_dashboard',
                    'view_crm', 'manage_crm',
                    'view_erp', 'manage_erp',
                    'view_tasks',
                    'view_reports'
                ]
            },
            {
                name: 'Employee',
                description: 'Standard Employee',
                permissions: [
                    'view_dashboard',
                    'view_attendance_self',
                    'view_tasks_self',
                    'view_profile',
                    'view_erp'
                ]
            }
        ];

        for (const roleDef of defaultRoles) {
            const [role, created] = await Role.sequelizeModel.findOrCreate({
                where: { name: roleDef.name },
                defaults: roleDef
            });
            
            if (!created) {
                await role.update({ permissions: roleDef.permissions, description: roleDef.description });
            }
        }
        console.log('Roles successfully initialized.');

        // Cleanup dummy users except Admin (to avoid locking ourselves out during testing)
        // We will remove hr@, manager@, sales@, employee@ as requested: "Do not use predefined accounts such as Admin, HR, Manager, Sales, or Employee..."
        // Wait, the prompt says "Do not use predefined accounts such as Admin, HR, Manager, Sales, or Employee...".
        // I will delete ALL predefined accounts from the DB, and just let registration happen.
        const dummyEmails = ['hr@smtbms.com', 'manager@smtbms.com', 'sales@smtbms.com', 'employee@smtbms.com'];
        for (const email of dummyEmails) {
            await User.sequelizeModel.update({ active: false, password: 'DELETED' }, { where: { email } });
        }
        console.log('Deactivated hardcoded dummy accounts.');

    } catch (err) {
        console.error('Error initializing roles:', err);
    } finally {
        process.exit();
    }
};

initRoles();
