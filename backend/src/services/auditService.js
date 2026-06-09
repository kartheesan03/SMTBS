const AuditLog = require('../models/AuditLog');

/**
 * Log an audit event.
 * @param {Object} params
 * @param {Object} params.user - The user performing the action (req.user)
 * @param {String} params.action - CREATE, UPDATE, DELETE, APPROVE, REJECT, LOGIN, EXPORT
 * @param {String} params.module - Material, Order, Customer, Employee, Vendor, Attendance, Leave, Salary, Task, Ticket, System
 * @param {Number} [params.targetId] - ID of the affected record
 * @param {String} [params.description] - Human-readable description
 * @param {Object} [params.changes] - JSON diff of changes
 * @param {String} [params.ipAddress] - Request IP address
 */
const logAudit = async ({ user, action, module, targetId, description, changes, ipAddress }) => {
    try {
        await AuditLog.create({
            userId: user?._id || user?.id || null,
            userName: user?.name || 'System',
            action,
            module,
            targetId: targetId || null,
            description: description || '',
            changes: changes || null,
            ipAddress: ipAddress || null
        });
    } catch (err) {
        console.error('Audit log error:', err.message);
    }
};

/**
 * Build a changes object by comparing old and new values.
 */
const buildChanges = (oldObj, newObj, fields) => {
    const changes = {};
    for (const field of fields) {
        const oldVal = oldObj[field];
        const newVal = newObj[field];
        if (oldVal !== newVal && newVal !== undefined) {
            changes[field] = { from: oldVal, to: newVal };
        }
    }
    return Object.keys(changes).length > 0 ? changes : null;
};

module.exports = { logAudit, buildChanges };
