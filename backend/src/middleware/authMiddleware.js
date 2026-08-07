const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const protect = async (req, res, next) => {
    let token;
    try {
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                console.error('[AUTH ERROR] User not found for id:', decoded.id);
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }
            req.user = user;
            const RoleSeq = Role.sequelizeModel || Role;
            const titleRole = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : '';
            const roleRecord = titleRole
                ? (await RoleSeq.findOne({ where: { name: titleRole } }) || await RoleSeq.findOne({ where: { name: user.role } }))
                : null;
            let userPerms = roleRecord
                ? (typeof roleRecord.permissions === 'string' ? JSON.parse(roleRecord.permissions) : roleRecord.permissions) ||
                  (roleRecord.dataValues?.permissions ? (typeof roleRecord.dataValues.permissions === 'string' ? JSON.parse(roleRecord.dataValues.permissions) : roleRecord.dataValues.permissions) : [])
                : [];
            req.user.permissions = Array.isArray(userPerms) ? [...userPerms] : [];
            if (user.role && user.role.toLowerCase() === 'hr') {
                const hrPerms = [
                    'view_hrms', 'manage_hrms',
                    'hrms:employeeData:view', 'hrms:employeeData:manage',
                    'hrms:attendance:view', 'hrms:attendance:manage',
                    'hrms:payroll:view', 'hrms:payroll:generate', 'hrms:payroll:manage',
                    'hrms:performance:view', 'hrms:performance:manage',
                    'hrms:leave:view', 'hrms:leave:manage',
                    'hrms:mySalary:view'
                ];
                hrPerms.forEach(p => { if (!req.user.permissions.includes(p)) req.user.permissions.push(p); });
            }
            if (user.role && user.role.toLowerCase() === 'sales') {
                const salesPerms = [
                    'view_dashboard', 'view_crm', 'manage_crm', 'view_erp', 'manage_erp'
                ];
                salesPerms.forEach(p => { if (!req.user.permissions.includes(p)) req.user.permissions.push(p); });
            }
            if (user.role && user.role.toLowerCase() === 'employee') {
                const empPerms = [
                    'view_materials_self', 'view_dashboard', 'view_tasks_self', 'view_leave_self', 'view_erp'
                ];
                empPerms.forEach(p => { if (!req.user.permissions.includes(p)) req.user.permissions.push(p); });
            }
            if (user.role && user.role.toLowerCase() === 'manager') {
                const managerPerms = [
                    'view_materials', 'manage_materials',
                    'view_hrms',
                    'view_erp', 'manage_erp',
                    'view_crm', 'manage_crm',
                    'view_tasks', 'manage_tasks',
                    'view_reports', 'view_dashboard'
                ];
                managerPerms.forEach(p => { if (!req.user.permissions.includes(p)) req.user.permissions.push(p); });
            }
            const reqMethod = req.method.toUpperCase();
            if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(reqMethod)) {
                const uRole = user.role ? user.role.toLowerCase() : '';
                const path = req.originalUrl || req.url;
                if (uRole !== 'admin' && uRole !== 'super admin' && user.email !== 'admin@smtbms.com') {
                    if (uRole === 'employee') {
                        // Employee: only self-service paths + scanner materials update
                        const isSelfService = path.includes('/api/attendance') ||
                                              path.includes('/api/leaves') ||
                                              path.includes('/api/tasks') ||
                                              path.includes('/api/notifications') ||
                                              path.includes('/api/communications') ||
                                              path.includes('/api/auth') ||
                                              path.includes('/api/employees/me') ||
                                              path.includes('/api/stock-requests') ||
                                              (path.includes('/api/orders') && (path.includes('employee-check') || path.includes('inventory-verification') || path.includes('employee-final-approval')));
                        const isScannerUpdate = path.includes('/api/materials') && reqMethod === 'PUT';
                        if (!isSelfService && !isScannerUpdate) {
                            return res.status(403).json({ message: `Access Denied: ${user.role} role has view-only permissions for this module.` });
                        }
                    }
                    if (uRole === 'sales') {
                        // Sales: can write to CRM, Quotations, Leads, Customers, Orders, Sales Goals
                        // and self-service paths
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