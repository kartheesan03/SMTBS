const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Broadcast a notification to relevant users or roles based on the action module.
 * @param {Object} params
 * @param {String} params.module - 'Payroll', 'Attendance', 'Orders', 'Materials', 'Stock Requests', 'Vendors', 'Customers', 'Leave Requests', 'Tasks', 'System'
 * @param {String|Number} params.referenceId - ID of the entity this relates to
 * @param {String} params.title
 * @param {String} params.message
 * @param {String} params.type - 'warning', 'info', 'success', 'error'
 * @param {String|Array} params.targetRoles - Roles that should receive this (e.g. ['Admin', 'HR'])
 * @param {String|Number} [params.targetUserId] - Specific user ID to notify
 * @param {Boolean} [params.isCritical] - If true, notifies all Admins and Managers
 * @param {Boolean} [params.targetOnly] - If true, ONLY sends to targetUserId
 * @param {Boolean} [params.exactRoles] - If true, ONLY sends to the exact roles provided (doesn't automatically add Admin)
 */
const broadcast = async ({ module = 'System', referenceId = null, title, message, type = 'info', targetRoles = [], targetUserId = null, isCritical = false, targetOnly = false, exactRoles = false }) => {
    try {
        const notificationsToCreate = [];
        const notifiedUserIds = new Set();
        
        // Always coerce referenceId to string
        const refIdStr = referenceId ? String(referenceId) : null;

        if (!targetOnly) {
            let rolesToNotify = new Set(Array.isArray(targetRoles) ? targetRoles : [targetRoles]);
            
            if (!exactRoles) {
                rolesToNotify.add('Admin'); // Admin gets everything
            }

            if (isCritical) {
                rolesToNotify.add('Manager');
                if (!exactRoles) {
                    rolesToNotify.add('Admin');
                }
            }

            const rolesArray = Array.from(rolesToNotify);

            // Find users matching roles
            const users = await User.find({ role: { $in: rolesArray }, active: true });
            
            // Create for target roles individually
            for (const user of users) {
                const uId = String(user._id || user.id);
                if (!notifiedUserIds.has(uId)) {
                    notificationsToCreate.push({
                        module,
                        referenceId: refIdStr,
                        userId: user._id || user.id, // Keep original numeric type
                        role: user.role,
                        title,
                        message,
                        type,
                        status: 'unread'
                    });
                    notifiedUserIds.add(uId);
                }
            }
        }

        // Add specific target user if not already included
        if (targetUserId) {
            const tId = String(targetUserId);
            if (!notifiedUserIds.has(tId)) {
                notificationsToCreate.push({
                    module,
                    referenceId: refIdStr,
                    userId: targetUserId, // Keep original type
                    role: null, // Specific user targets might have multiple roles, or we just rely on userId
                    title,
                    message,
                    type,
                    status: 'unread'
                });
                notifiedUserIds.add(tId);
            }
        }

        if (notificationsToCreate.length > 0) {
            await Notification.insertMany(notificationsToCreate);
        }
    } catch (err) {
        console.error('Broadcast notification error:', err);
    }
};

// Domain-specific helpers
const notifyHR = (params) => broadcast({ ...params, targetRoles: ['HR'], module: params.module || 'System' });
const notifySales = (params) => broadcast({ ...params, targetRoles: ['Sales'], module: params.module || 'System' });
const notifyManager = (params) => broadcast({ ...params, targetRoles: ['Manager'], module: params.module || 'System' });
const notifyCritical = (params) => broadcast({ ...params, isCritical: true, type: params.type || 'warning' });

module.exports = { 
    broadcast,
    notifyHR,
    notifySales,
    notifyManager,
    notifyCritical
};
