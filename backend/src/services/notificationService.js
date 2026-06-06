const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Broadcast a notification to relevant users based on the action category.
 * @param {Object} params
 * @param {String} params.title
 * @param {String} params.message
 * @param {String} params.type - 'warning', 'info', 'success', 'error'
 * @param {String} params.category - 'stock', 'hr', 'order', 'system', 'general'
 * @param {String|Array} params.targetRoles - Roles that should receive this (e.g. ['Admin', 'HR'])
 * @param {String} [params.targetUserId] - Specific user ID to notify (e.g. the employee whose leave was approved)
 * @param {Boolean} [params.isCritical] - If true, notifies all Admins and Managers
 * @param {String} [params.link] - Optional link
 * @param {Boolean} [params.targetOnly] - If true, ONLY sends to targetUserId
 * @param {Boolean} [params.exactRoles] - If true, ONLY sends to the exact roles provided (doesn't automatically add Admin)
 */
const broadcast = async ({ title, message, type = 'info', category = 'general', targetRoles = [], targetUserId = null, isCritical = false, link = null, targetOnly = false, exactRoles = false }) => {
    try {
        const notificationsToCreate = [];
        const notifiedUserIds = new Set();

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
            
            // Create for target roles
            for (const user of users) {
                const uId = String(user._id || user.id);
                if (!notifiedUserIds.has(uId)) {
                    notificationsToCreate.push({
                        title,
                        message,
                        type,
                        category,
                        userId: user._id || user.id, // Keep original numeric type
                        isRead: false,
                        link
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
                    title,
                    message,
                    type,
                    category,
                    userId: targetUserId, // Keep original type
                    isRead: false,
                    link
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
const notifyHR = (params) => broadcast({ ...params, targetRoles: ['HR'], category: params.category || 'hr' });
const notifySales = (params) => broadcast({ ...params, targetRoles: ['Sales'], category: params.category || 'general' });
const notifyManager = (params) => broadcast({ ...params, targetRoles: ['Manager'], category: params.category || 'system' });
const notifyCritical = (params) => broadcast({ ...params, isCritical: true, type: params.type || 'warning' });

module.exports = { 
    broadcast,
    notifyHR,
    notifySales,
    notifyManager,
    notifyCritical
};
