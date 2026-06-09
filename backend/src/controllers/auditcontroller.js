const AuditLog = require('../models/AuditLog');

// @desc    Get audit logs with filtering
// @route   GET /api/audit-logs
// @access  Private/Admin
const getAuditLogs = async (req, res) => {
    try {
        const { module, action, userId, startDate, endDate, limit } = req.query;
        const query = {};

        if (module) query.module = module;
        if (action) query.action = action;
        if (userId) query.userId = userId;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const logs = await AuditLog.find(query)
            .populate('user', 'name role')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit) || 100);

        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get audit log stats
// @route   GET /api/audit-logs/stats
// @access  Private/Admin
const getAuditStats = async (req, res) => {
    try {
        const totalLogs = await AuditLog.countDocuments();
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayLogs = await AuditLog.countDocuments({ createdAt: { $gte: todayStart } });

        res.json({ totalLogs, todayLogs });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAuditLogs, getAuditStats };
