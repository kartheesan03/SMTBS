const navigationConfig = [
    {
        title: 'Dashboard',
        icon: 'LayoutDashboard',
        path: '/',
        permission: 'view_dashboard'
    },
    {
        title: 'Material Tracking',
        icon: 'Box',
        permission: 'view_materials',
        children: [
            { title: 'Inventory', path: '/materials' },
            { title: 'Movement Tracking', path: '/tracking-overview' },
            { title: 'Stock Monitoring', path: '/stock-requests' },
            { title: 'Barcode / QR', path: '/materials/barcode' }
        ]
    },
    {
        title: 'HRMS',
        icon: 'Users',
        permission: 'view_hrms',
        children: [
            { title: 'Employee Data', path: '/hrms' },
            { title: 'Attendance', path: '/attendance' },
            { title: 'Leave Management', path: '/leave-management' },
            { title: 'Payroll', path: '/payroll' },
            { title: 'Performance', path: '/team-performance' }
        ]
    },
    {
        title: 'ERP',
        icon: 'Database',
        permission: 'view_erp',
        children: [
            { title: 'Procurement', path: '/erp' },
            { title: 'Purchase', path: '/erp/purchase' },
            { title: 'Vendor Management', path: '/vendors' },
            { title: 'Financial Tracking', path: '/erp/finance' },
            { title: 'Order Management', path: '/orders' }
        ]
    },
    {
        title: 'CRM',
        icon: 'Briefcase',
        permission: 'view_crm',
        children: [
            { title: 'Customer Data', path: '/crm' },
            { title: 'Sales Pipeline', path: '/crm/pipeline' },
            { title: 'Leads', path: '/crm/leads' },
            { title: 'Sales', path: '/erp/sales' },
            { title: 'Support Management', path: '/support' }
        ]
    },
    {
        title: 'Tasks & Projects',
        icon: 'CheckSquare',
        permission: 'all',
        children: [
            { title: 'My Tasks', path: '/my-tasks' },
            { title: 'Assigned Tasks', path: '/tasks/assigned' },
            { title: 'Projects', path: '/projects' }
        ]
    },
    {
        title: 'Financial Operations',
        icon: 'DollarSign',
        path: '/finance',
        permission: 'view_reports'
    },
    {
        title: 'Reports & Analytics',
        icon: 'BarChart2',
        path: '/analytics',
        permission: 'view_reports'
    },
    {
        title: 'Settings',
        icon: 'Settings',
        permission: 'view_settings',
        children: [
            { title: 'General Settings', path: '/settings' },
            { title: 'User Management', path: '/users' },
            { title: 'Roles & Permissions', path: '/settings/roles' },
            { title: 'Audit Logs', path: '/settings/audit-logs' },
            { title: 'Backup & Restore', path: '/settings/backup' },
            { title: 'Integrations', path: '/settings/integrations' }
        ]
    }
];

const Role = require('../models/Role');

exports.getNavigation = async (req, res) => {
    try {
        let userPermissions = [];
        
        // Find role to get permissions
        if (req.user && req.user.role) {
            const role = await Role.findOne({ name: req.user.role });
            if (role) {
                userPermissions = typeof role.permissions === 'string' ? JSON.parse(role.permissions) : (role.permissions || []);
            }
        }
        
        const roleName = req.user.role ? req.user.role.toLowerCase() : '';
        // If it's the super admin or admin, they get everything
        if (req.user.email === 'admin@smtbms.com' || roleName === 'admin' || roleName === 'super admin') {
            userPermissions.push('all');
        }
        
        // Filter navigation based on user permissions
        const filteredNav = navigationConfig.filter(item => {
            if (!item.permission) return true;
            return userPermissions.includes(item.permission) || userPermissions.includes('all');
        });

        res.json(filteredNav);
    } catch (error) {
        console.error('Error fetching navigation:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
