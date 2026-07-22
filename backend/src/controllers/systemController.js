// ─── Navigation for non-HR roles (Admin, Manager, Employee, Sales, etc.) ──────
const navigationConfig = [
    {
        title: 'Dashboard',
        icon: 'LayoutDashboard',
        path: '/',
        permission: 'view_dashboard'
    },
    {
        title: 'Attendance',
        icon: 'CalendarCheck',
        path: '/attendance',
        permission: ''
    },

    {
        title: 'My Salary',
        icon: 'Wallet',
        path: '/my-salary',
        permission: ''
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
        title: 'Material Tracking',
        icon: 'Box',
        permission: 'view_materials_self',
        children: [
            { title: 'Inventory', path: '/my-materials/inventory' },
            { title: 'Movement Tracking', path: '/my-materials/requests' },
            { title: 'Stock Monitoring', path: '/my-materials/stock' },
            { title: 'Barcode / QR', path: '/my-materials/barcode' }
        ]
    },
    {
        title: 'ERP',
        icon: 'Database',
        permission: 'view_erp',
        children: [
            { title: 'Procurement', path: '/erp' },
            { title: 'Vendor Management', path: '/vendors' },
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
            { title: 'Sales', path: '/erp/sales' }
        ]
    },
    {
        title: 'Support Management',
        icon: 'LifeBuoy',
        path: '/support',
        permission: 'view_crm'
    },
    {
        title: 'Tasks & Projects',
        icon: 'CheckSquare',
        permission: 'view_tasks',
        children: [
            { title: 'All Tasks', path: '/my-tasks' },
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
        title: 'Notifications',
        icon: 'Bell',
        path: '/notifications',
        permission: ''
    },
    {
        title: 'Settings',
        icon: 'Settings',
        permission: '',
        children: [
            { title: 'General Settings', path: '/settings', permission: '' },
            { title: 'User Management', path: '/users', permission: 'manage_users' },
            { title: 'Roles & Permissions', path: '/settings/roles', permission: 'manage_settings' },
            { title: 'Audit Logs', path: '/settings/audit-logs', permission: 'view_audit_logs' },
            { title: 'Backup & Restore', path: '/settings/backup', permission: 'manage_backup' },
            { title: 'Integrations', path: '/settings/integrations', permission: 'manage_settings' }
        ]
    }
];

// ─── Dedicated HR Navigation (role: 'hr' only) ────────────────────────────────
// Mirrors the FarmakuSidebar design with full HR-specific module hierarchy.
const hrNavigationConfig = [
    {
        title: 'Dashboard',
        icon: 'LayoutDashboard',
        path: '/',
        permission: ''
    },
    {
        title: 'Attendance',
        icon: 'CalendarCheck',
        permission: 'view_hrms',
        children: [
            { title: 'Employee Attendance', path: '/attendance' },
            { title: 'Master Attendance',   path: '/attendance/master' }
        ]
    },

    {
        title: 'Employee Management',
        icon: 'Users',
        path: '/hrms',
        permission: 'view_hrms'
    },
    {
        title: 'All Leave Requests',
        icon: 'CalendarDays',
        permission: 'view_hrms',
        children: [
            { title: 'Leave Requests', path: '/leave-management' },
            { title: 'Leave History',  path: '/leave-management/history' },
            { title: 'Leave Balance',  path: '/leave-management/balance' }
        ]
    },
    {
        title: 'Payroll',
        icon: 'DollarSign',
        permission: 'view_hrms',
        children: [
            { title: 'Generate Payroll', path: '/payroll/generate', permission: 'manage_hrms' },
            { title: 'Salary Details',   path: '/payroll' },
            { title: 'Payslips',         path: '/payslips' }
        ]
    },
    {
        title: 'Performance',
        icon: 'TrendingUp',
        path: '/team-performance',
        permission: 'view_hrms'
    },
    {
        title: 'Recruitment',
        icon: 'UserPlus',
        path: '/coming-soon/recruitment',
        permission: 'view_hrms'
    },
    {
        title: 'Training',
        icon: 'BookOpen',
        path: '/coming-soon/training',
        permission: 'view_hrms'
    },
    {
        title: 'Reports',
        icon: 'BarChart2',
        path: '/hr-reports',
        permission: 'view_hrms'
    },
    {
        title: 'Notifications',
        icon: 'Bell',
        path: '/notifications',
        permission: ''
    },
    {
        title: 'Holiday Calendar',
        icon: 'CalendarRange',
        path: '/coming-soon/holiday-calendar',
        permission: ''
    },
    {
        title: 'Help & Support',
        icon: 'HelpCircle',
        path: '/support',
        permission: ''
    },
    {
        title: 'Settings',
        icon: 'Settings',
        permission: '',
        children: [
            { title: 'General Settings',  path: '/settings',              permission: '' },
            { title: 'Attendance Policy', path: '/settings/attendance',   permission: '' },
            { title: 'Leave Policies',    path: '/settings/leave',        permission: '' },
            { title: 'Payroll Settings',  path: '/settings/payroll',      permission: '' }
        ]
    }
];

const Role = require('../models/Role');

exports.getNavigation = async (req, res) => {
    try {
        // auth middleware already fetched & attached permissions via Role lookup
        let userPermissions = Array.isArray(req.user.permissions) ? req.user.permissions : [];
        
        const roleName = req.user.role ? req.user.role.toLowerCase() : '';

        // Super Admin / Admin get everything
        if (req.user.email === 'admin@smtbms.com' || roleName === 'admin' || roleName === 'super admin') {
            userPermissions.push('all');
        }

        // Grant employee access to the self-service materials menu
        if (roleName === 'employee') {
            userPermissions.push('view_materials_self');
        }

        // ── HR role: use the dedicated HR navigation config ───────────────────
        if (roleName === 'hr') {
            const filteredHRNav = hrNavigationConfig.map(item => {
                // Hide parent if permission is required and user doesn't have it
                if (item.permission && !userPermissions.includes(item.permission) && !userPermissions.includes('all')) {
                    return null;
                }
                // Filter children by their individual permissions
                if (item.children) {
                    const filteredChildren = item.children.filter(child => {
                        if (!child.permission) return true;
                        return userPermissions.includes(child.permission) || userPermissions.includes('all');
                    });
                    return { ...item, children: filteredChildren };
                }
                return item;
            }).filter(Boolean);

            return res.json(filteredHRNav);
        }

        // ── All other roles: use the standard navigation config ───────────────
        let filteredNav = navigationConfig.map(item => {
            // First check if user can see parent
            if (item.permission) {
                // If the item requires 'view_tasks', also allow 'view_tasks_self'
                if (item.permission === 'view_tasks' && userPermissions.includes('view_tasks_self')) {
                    // allow
                }
                else if (!userPermissions.includes(item.permission) && !userPermissions.includes('all')) {
                    return null;
                }
            }
            
            // Then filter children if they exist
            if (item.children) {
                const filteredChildren = item.children.filter(child => {
                    if (!child.permission) return true;
                    return userPermissions.includes(child.permission) || userPermissions.includes('all');
                });
                return { ...item, children: filteredChildren };
            }
            return item;
        }).filter(Boolean); // Remove nulls

        // Prevent duplicate "Material Tracking" for Admin/Manager who have both permissions
        const hasFullMaterialTracking = filteredNav.some(i => i.title === 'Material Tracking' && i.permission === 'view_materials');
        if (hasFullMaterialTracking) {
            filteredNav = filteredNav.filter(i => !(i.title === 'Material Tracking' && i.permission === 'view_materials_self'));
        }

        res.json(filteredNav);
    } catch (error) {
        console.error('Error fetching navigation:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
