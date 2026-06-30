const Role = require('../models/Role');

exports.getRoles = async (req, res) => {
    try {
        const roles = await Role.find();
        res.json(roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.createRole = async (req, res) => {
    try {
        let { name, description, permissions } = req.body;
        
        if (permissions) {
            if (typeof permissions === 'string') {
                try {
                    permissions = JSON.parse(permissions);
                } catch (e) {
                    return res.status(400).json({ message: 'Permissions must be a valid JSON array' });
                }
            }
            if (!Array.isArray(permissions)) {
                return res.status(400).json({ message: 'Permissions must be an array' });
            }
        } else {
            permissions = [];
        }
        
        const roleExists = await Role.findOne({ name });
        if (roleExists) {
            return res.status(400).json({ message: 'Role already exists' });
        }

        const role = await Role.create({ name, description, permissions });
        res.status(201).json(role);
    } catch (error) {
        console.error('Error creating role:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateRole = async (req, res) => {
    try {
        let { name, description, permissions } = req.body;
        const role = await Role.findById(req.params.id);

        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        if (permissions) {
            if (typeof permissions === 'string') {
                try {
                    permissions = JSON.parse(permissions);
                } catch (e) {
                    return res.status(400).json({ message: 'Permissions must be a valid JSON array' });
                }
            }
            if (!Array.isArray(permissions)) {
                return res.status(400).json({ message: 'Permissions must be an array' });
            }
        }

        role.name = name || role.name;
        role.description = description || role.description;
        if (permissions) {
            role.permissions = permissions;
        }

        const updatedRole = await role.save();
        res.json(updatedRole);
    } catch (error) {
        console.error('Error updating role:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteRole = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);

        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        if (['Super Admin', 'Admin', 'Employee', 'Customer', 'Vendor', 'HR', 'Manager', 'Sales'].includes(role.name)) {
            return res.status(400).json({ message: 'Cannot delete system-protected role' });
        }

        await Role.findByIdAndDelete(req.params.id);
        res.json({ message: 'Role removed' });
    } catch (error) {
        console.error('Error deleting role:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Return a list of all possible permissions for the UI to display checkboxes
exports.getPermissions = async (req, res) => {
    try {
        const permissions = [
            'view_dashboard',
            'view_hrms', 'manage_hrms',
            'view_materials', 'manage_materials',
            'view_crm', 'manage_crm',
            'view_erp', 'manage_erp',
            'view_tasks', 'manage_tasks', 'view_tasks_self',
            'view_reports', 'manage_reports',
            'view_attendance', 'manage_attendance', 'view_attendance_self',
            'manage_users', 'view_profile',
            'view_settings', 'manage_settings',
            'view_audit_logs',
            'manage_backup', 'create_backup', 'restore_backup', 'delete_backup',
            'create_hr_backup', 'create_manager_backup',
            'all'
        ];
        res.json(permissions);
    } catch (error) {
        console.error('Error fetching permissions:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
