const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Build permissions inline from role — no DB roundtrip needed
const buildPermissionsFromRole = (role) => {
    const perms = [];
    if (!role) return perms;
    const r = role.toLowerCase();
    if (r === 'admin' || r === 'super admin') {
        return ['all'];
    }
    if (r === 'hr') {
        perms.push(
            'view_hrms', 'manage_hrms',
            'hrms:employeeData:view', 'hrms:employeeData:manage',
            'hrms:attendance:view', 'hrms:attendance:manage',
            'hrms:payroll:view', 'hrms:payroll:generate', 'hrms:payroll:manage',
            'hrms:performance:view', 'hrms:performance:manage',
            'hrms:leave:view', 'hrms:leave:manage',
            'hrms:mySalary:view'
        );
    }
    if (r === 'sales') {
        perms.push('view_dashboard', 'view_crm', 'manage_crm', 'view_erp', 'manage_erp');
    }
    if (r === 'employee') {
        perms.push('view_materials_self', 'view_dashboard', 'view_tasks_self', 'view_leave_self', 'view_erp');
    }
    if (r === 'manager') {
        perms.push(
            'view_materials', 'manage_materials',
            'view_hrms',
            'view_erp', 'manage_erp',
            'view_crm', 'manage_crm',
            'view_tasks', 'manage_tasks',
            'view_reports', 'view_dashboard'
        );
    }
    return perms;
};

const protect = async (req, res, next) => {
    let token;
    try {
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.sequelizeModel.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
            if (!user) {
                console.error('[AUTH ERROR] User not found for id:', decoded.id);
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }
            req.user = user;

            // Use role from JWT (fast, no DB) — fallback to user.role from DB
            const effectiveRole = decoded.role || user.role || '';
            req.user.permissions = buildPermissionsFromRole(effectiveRole);

            const reqMethod = req.method.toUpperCase();
            if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(reqMethod)) {
                const uRole = user.role ? user.role.toLowerCase() : '';
                const path = req.originalUrl || req.url;
                if (uRole !== 'admin' && uRole !== 'super admin' && user.email !== 'admin@smtbms.com') {
                    if (uRole === 'employee') {
                        const isSelfService = path.includes('/api/attendance') ||
                                              path.includes('/api/leaves') ||
                                              path.includes('/api/tasks') ||
                                              path.includes('/api/notifications') ||
                                              path.includes('/api/communications') ||
                                              path.includes('/api/auth') ||
                                              path.includes('/api/employees/me') ||
                                              path.includes('/api/stock-requests') ||
                                              path.includes('/api/feed') ||
                                              path.includes('/api/ocr') ||
                                              (path.includes('/api/orders') && (path.includes('employee-check') || path.includes('inventory-verification') || path.includes('employee-final-approval')));
                        const isScannerUpdate = path.includes('/api/materials') && reqMethod === 'PUT';
                        if (!isSelfService && !isScannerUpdate) {
                            return res.status(403).json({ message: `Access Denied: ${user.role} role has view-only permissions for this module.` });
                        }
                    }
                    if (uRole === 'sales') {
                        const isSalesAllowed = path.includes('/api/leads') ||
                                               path.includes('/api/customers') ||
                                               path.includes('/api/quotations') ||
                                               path.includes('/api/orders') ||
                                               path.includes('/api/sales-goals') ||
                                               path.includes('/api/stock-requests') ||
                                               path.includes('/api/tasks') ||
                                               path.includes('/api/attendance') ||
                                               path.includes('/api/leaves') ||
                                               path.includes('/api/notifications') ||
                                               path.includes('/api/communications') ||
                                               path.includes('/api/auth') ||
                                               path.includes('/api/feed') ||
                                               path.includes('/api/ocr') ||
                                               path.includes('/api/employees/me');
                        if (!isSalesAllowed) {
                            return res.status(403).json({ message: `Access Denied: ${user.role} role cannot modify this resource.` });
                        }
                    }
                }
            }
            return next();
        }
        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }
    } catch (error) {
        require('fs').writeFileSync('auth_error.log', error.stack || error.toString());
        console.error('[AUTH ERROR] Catch block:', error);
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};
const authorize = (...requiredPermissions) => {
    return (req, res, next) => {
        if (!req.user) {
            console.log(`[AUTH LOG] Denied: No user found in request`);
            return res.status(401).json({ message: 'Not authorized' });
        }
        if (req.user.email === 'admin@smtbms.com' || req.user.role === 'Super Admin' || req.user.role === 'Admin') {
            console.log(`[AUTH LOG] Allowed: Admin bypass for user ${req.user.email}`);
            return next();
        }
        const hasPermission = requiredPermissions.some(permission =>
            req.user.permissions.includes(permission)
        );
        if (hasPermission) {
            console.log(`[AUTH LOG] Allowed: User ${req.user.email} (${req.user.role}) has required permission`);
            return next();
        }
        console.log(`[AUTH LOG] Denied: User ${req.user.email} (${req.user.role}) lacks permissions: ${requiredPermissions.join(', ')}`);
        return res.status(403).json({ message: `User role ${req.user.role} is not authorized to perform this action` });
    };
};
module.exports = { protect, authorize };