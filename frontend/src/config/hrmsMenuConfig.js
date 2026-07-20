export const hrmsMenuItems = [
  { label: 'Employee Data', icon: 'Users', path: '/hrms', permission: 'hrms:employeeData:view' },
  { label: 'Master Attendance', icon: 'CalendarCheck', path: '/attendance/master', permission: 'hrms:attendance:view' },

  { label: 'Leave Management', icon: 'FileText', path: '/leave-management/history', permission: 'hrms:leaveHistory:view' },
  { label: 'All Leave Requests', icon: 'CalendarDays', path: '/leave-management', permission: 'hrms:leave:view' },
  { label: 'Payroll', icon: 'DollarSign', path: '/payroll', permission: 'hrms:payroll:view' },
  { label: 'Performance', icon: 'TrendingUp', path: '/team-performance', permission: 'hrms:performance:view' }
];

export const rolePermissions = {
  admin: ['*'],
  'super admin': ['*'],
  hr: [
    'hrms:employeeData:view',
    'hrms:attendance:view',
    'hrms:applyLeave:view',
    'hrms:leaveHistory:view',
    'hrms:leave:view',
    'hrms:payroll:view',
    'hrms:payroll:generate',
    'hrms:performance:view',
    'hrms:mySalary:view'
  ],
  manager: [
    'hrms:employeeData:view',
    'hrms:attendance:view',
    'hrms:applyLeave:view',
    'hrms:leaveHistory:view',
    'hrms:leave:view',
    'hrms:performance:view',
    'hrms:mySalary:view'
  ],
  employee: [
    'hrms:applyLeave:view',
    'hrms:leaveHistory:view',
    'hrms:mySalary:view'
  ]
};

export const hasHrmsPermission = (user, permission) => {
  if (!user) return false;

  const role = (user.role || '').toLowerCase();

  // 1. Check if user is a system super admin by email
  if (user.email === 'admin@smtbms.com') return true;

  // 2. Check if role has blanket '*' permission
  if (rolePermissions[role] && rolePermissions[role].includes('*')) return true;

  // 3. Check individual overrides (from user.permissions array)
  if (Array.isArray(user.permissions)) {
    if (user.permissions.includes('all') || user.permissions.includes(permission)) return true;
  }

  // 4. Check static role permissions
  if (rolePermissions[role] && rolePermissions[role].includes(permission)) return true;

  return false;
};
