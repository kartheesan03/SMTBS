const navigationConfig = [
    {
        title: 'Dashboard',
        icon: 'LayoutDashboard',
        path: '/',
        permission: 'view_dashboard',
        group: 'WORKSPACE'
    },
    {
        title: 'Tasks & Projects',
        icon: 'CheckSquare',
        permission: 'view_tasks',
        group: 'WORKSPACE',
        children: [
            { title: 'All Tasks', path: '/my-tasks' },
            { title: 'Projects', path: '/projects' }
        ]
    },
    {
        title: 'OCR Documents',
        icon: 'FileText',
        path: '/ocr',
        permission: '',
        group: 'OPERATIONS'
    },
    {
        title: 'Company Feed',
        icon: 'Globe',
        path: '/feed',
        permission: '',
        group: 'WORKSPACE'
    },
    {
        title: 'Material Tracking',
        icon: 'Box',
        permission: 'view_materials',
        group: 'MATERIALS',
        children: [
            { title: 'Inventory', path: '/materials', permission: 'view_materials' },
            { title: 'Movement Tracking', path: '/tracking-overview', permission: 'view_materials' },
            { title: 'Stock Monitoring', path: '/stock-requests', permission: 'view_materials' },
            { title: 'Barcode / QR', path: '/materials/barcode', permission: 'view_materials' },
            { title: 'Material Requests', path: '/my-materials/requests', permission: 'view_materials' },
            { title: 'Warehouse Management', path: '/warehouses', permission: 'manage_materials' },
            { title: 'Reports', path: '/reports/materials', permission: 'view_reports' }
        ]
    },
    {
        title: 'My Materials',
        icon: 'Box',
        permission: 'view_materials_self',
        group: 'MATERIALS',
        children: [
            { title: 'Assigned Inventory', path: '/my-materials/inventory', permission: 'view_materials_self' },
            { title: 'Movement Tracking', path: '/tracking-overview', permission: 'view_materials_self' },
            { title: 'Barcode / QR', path: '/my-materials/barcode', permission: 'view_materials_self' },
            { title: 'Material Requests', path: '/my-materials/requests', permission: 'view_materials_self' }
        ]
    },
    {
        title: 'ERP',
        icon: 'Database',
        permission: 'view_erp',
        group: 'PROCUREMENT',
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
        group: 'BUSINESS',
        children: [
            { title: 'Customer Data', path: '/crm' },
            { title: 'Sales Pipeline', path: '/crm/pipeline' },
            { title: 'Leads', path: '/crm/leads' },
            { title: 'Quotations', path: '/quotations' },
            { title: 'Sales Goals', path: '/sales/goals' }
        ]
    },
    {
        title: 'Financial Operations',
        icon: 'DollarSign',
        permission: 'view_reports',
        group: 'BUSINESS',
        children: [
            { title: 'Overview', path: '/finance' }
        ]
    },
    {
        title: 'HRMS',
        icon: 'Users',
        permission: 'view_hrms',
        group: 'PEOPLE',
        children: [
            { title: 'Employee Data', path: '/hrms' },
            { title: 'Master Attendance', path: '/attendance/master' },
            { title: 'All Leave Requests', path: '/leave-management' },
            { title: 'Payroll', path: '/payroll' },
            { title: 'Performance', path: '/team-performance' }
        ]
    },
    {
        title: 'Attendance',
        icon: 'CalendarCheck',
        path: '/attendance',
        permission: '',
        group: 'PEOPLE'
    },
    {
        title: 'Leave Management',
        icon: 'CalendarDays',
        path: '/leave-management/history',
        permission: 'view_leave_self',
        group: 'PEOPLE'
    },
    {
        title: 'My Salary',
        icon: 'Wallet',
        path: '/my-salary',
        permission: '',
        group: 'PEOPLE'
    },
    {
        title: 'Reports & Analytics',
        icon: 'BarChart2',
        path: '/analytics',
        permission: 'view_reports',
        group: 'INTELLIGENCE'
    },

    {
        title: 'Notifications',
        icon: 'Bell',
        path: '/notifications',
        permission: '',
        group: 'SYSTEM'
    },
    {
        title: 'Support Management',
        icon: 'LifeBuoy',
        path: '/support/admin',
        permission: 'view_crm',
        group: 'SYSTEM'
    },
    {
        title: 'Audit Logs',
        icon: 'ClipboardList',
        path: '/settings/audit-logs',
        permission: 'view_audit_logs',
        group: 'SYSTEM'
    },
    {
        title: 'Settings',
        icon: 'Settings',
        permission: '',
        group: 'SYSTEM',
        children: [
            { title: 'General Settings', path: '/settings', permission: '' },
            { title: 'User Management', path: '/users', permission: 'manage_users' },
            { title: 'Roles & Permissions', path: '/settings/roles', permission: 'manage_settings' },
            { title: 'Backup & Restore', path: '/settings/backup', permission: 'manage_backup' },
            { title: 'Integrations', path: '/settings/integrations', permission: 'manage_settings' }
        ]
    }
];
const hrNavigationConfig = [
    {
        title: 'Dashboard',
        icon: 'LayoutDashboard',
        path: '/',
        permission: '',
        group: 'WORKSPACE'
    },
    {
        title: 'Company Feed',
        icon: 'Globe',
        path: '/feed',
        permission: '',
        group: 'WORKSPACE'
    },
    {
        title: 'Employee Management',
        icon: 'Users',
        path: '/hrms',
        permission: 'view_hrms',
        group: 'PEOPLE'
    },
    {
        title: 'Attendance',
        icon: 'CalendarCheck',
        permission: 'view_hrms',
        group: 'PEOPLE',
        children: [
            { title: 'Employee Attendance', path: '/attendance' },
            { title: 'Master Attendance',   path: '/attendance/master' }
        ]
    },
    {
        title: 'All Leave Requests',
        icon: 'CalendarDays',
        permission: 'view_hrms',
        group: 'PEOPLE',
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
        group: 'PEOPLE',
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
        permission: 'view_hrms',
        group: 'PEOPLE'
    },
    {
        title: 'Recruitment',
        icon: 'UserPlus',
        path: '/coming-soon/recruitment',
        permission: 'view_hrms',
        group: 'PEOPLE'
    },
    {
        title: 'Training',
        icon: 'BookOpen',
        path: '/coming-soon/training',
        permission: 'view_hrms',
        group: 'PEOPLE'
    },
    {
        title: 'Reports',
        icon: 'BarChart2',
        path: '/hr-reports',
        permission: 'view_hrms',
        group: 'INTELLIGENCE'
    },
    {
        title: 'Holiday Calendar',
        icon: 'CalendarRange',
        path: '/coming-soon/holiday-calendar',
        permission: '',
        group: 'WORKSPACE'
    },
    {
        title: 'OCR Documents',
        icon: 'FileText',
        path: '/ocr',
        permission: '',
        group: 'OPERATIONS'
    },

    {
        title: 'Notifications',
        icon: 'Bell',
        path: '/notifications',
        permission: '',
        group: 'SYSTEM'
    },
    {
        title: 'Help & Support',
        icon: 'HelpCircle',
        path: '/support',
        permission: '',
        group: 'SYSTEM'
    },
    {
        title: 'Settings',
        icon: 'Settings',
        permission: '',
        group: 'SYSTEM',
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
        let userPermissions = Array.isArray(req.user.permissions) ? [...req.user.permissions] : [];
        const roleName = req.user.role ? req.user.role.toLowerCase() : '';
        console.log(`[getNavigation] User Email: ${req.user.email}, Role: ${roleName}, Permissions: ${userPermissions}`);
        if (req.user.email === 'admin@smtbms.com' || roleName === 'admin' || roleName === 'super admin' || roleName === 'system admin') {
            userPermissions.push('all');
        }
        if (roleName === 'employee') {
            userPermissions.push('view_materials_self', 'view_dashboard', 'view_tasks_self', 'view_leave_self', 'view_erp');
        }
        if (roleName === 'sales') {
            userPermissions.push('view_dashboard', 'view_crm', 'manage_crm', 'view_erp', 'manage_erp');
        }
        if (roleName === 'hr') {
            userPermissions.push(
                'view_hrms', 'manage_hrms',
                'hrms:employeeData:view', 'hrms:employeeData:manage',
                'hrms:attendance:view', 'hrms:attendance:manage',
                'hrms:payroll:view', 'hrms:payroll:generate', 'hrms:payroll:manage',
                'hrms:performance:view', 'hrms:performance:manage',
                'hrms:leave:view', 'hrms:leave:manage',
                'hrms:mySalary:view'
            );
        }
        if (roleName === 'hr') {
            const filteredHRNav = hrNavigationConfig.map(item => {
                if (item.permission && !userPermissions.includes(item.permission) && !userPermissions.includes('all')) {
                    return null;
                }
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
        let filteredNav = navigationConfig.map(item => {
            if (item.permission) {
                if (item.permission === 'view_tasks' && userPermissions.includes('view_tasks_self')) {
                }
                else if (!userPermissions.includes(item.permission) && !userPermissions.includes('all')) {
                    return null;
                }
            }
            if (item.children) {
                const filteredChildren = item.children.filter(child => {
                    if (!child.permission) return true;
                    return userPermissions.includes(child.permission) || userPermissions.includes('all');
                });
                return { ...item, children: filteredChildren };
            }
            return item;
        }).filter(Boolean);
        const hasFullMaterialTracking = filteredNav.some(i => i.title === 'Material Tracking' && i.permission === 'view_materials');
        if (hasFullMaterialTracking) {
            filteredNav = filteredNav.filter(i => !(i.title === 'My Materials' && i.permission === 'view_materials_self'));
        }
        res.json(filteredNav);
    } catch (error) {
        console.error('Error fetching navigation:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
