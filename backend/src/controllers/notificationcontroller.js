const Notification = require('../models/Notification');
const Material = require('../models/Material');
const Order = require('../models/Order');

// @desc    Get all notifications (global + user-specific), newest first
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            $or: [
                { user: null },             // global notifications visible to all
                { user: req.user._id }      // user-specific notifications
            ]
        }).sort({ createdAt: -1 });

        const unreadCount = notifications.filter(n => !n.isRead).length;

        res.json({ notifications, unreadCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Only allow read if it belongs to this user or is global
        if (notification.user && notification.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this notification' });
        }

        notification.isRead = true;
        await notification.save();

        res.json({ message: 'Notification marked as read', notification });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark ALL notifications as read for the current user
// @route   PUT /api/notifications/mark-all-read
// @access  Private
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            {
                isRead: false,
                $or: [
                    { user: null },
                    { user: req.user._id }
                ]
            },
            { $set: { isRead: true } }
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a single notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        await notification.deleteOne();
        res.json({ message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Seed system notifications (called once or on demand by admin)
// @route   POST /api/notifications/seed
// @access  Private (Admin only)
const seedNotifications = async (req, res) => {
    try {
        // Check for actual low-stock materials and create real notifications
        const lowStock = await Material.find({
            $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
        });

        const seedData = [];

        // Add real low-stock alerts
        for (const mat of lowStock) {
            const exists = await Notification.findOne({
                category: 'stock',
                title: `Low Stock Alert: ${mat.name}`
            });
            if (!exists) {
                seedData.push({
                    title: `Low Stock Alert: ${mat.name}`,
                    message: `${mat.name} (SKU: ${mat.sku}) reached critical level: ${mat.quantity} ${mat.unit}.`,
                    type: 'warning',
                    category: 'stock',
                    user: null
                });
            }
        }

        // Add recent confirmed orders as notifications
        const confirmedOrders = await Order.find({ status: 'Confirmed' })
            .populate('customer', 'name')
            .sort({ createdAt: -1 })
            .limit(3);

        for (const order of confirmedOrders) {
            const exists = await Notification.findOne({
                category: 'order',
                title: `Order Confirmed: ${order.orderNumber}`
            });
            if (!exists) {
                seedData.push({
                    title: `Order Confirmed: ${order.orderNumber}`,
                    message: `Order ${order.orderNumber} from ${order.customer?.name || 'a customer'} has been confirmed.`,
                    type: 'success',
                    category: 'order',
                    user: null
                });
            }
        }

        // Seed default system notification if none exist at all
        const total = await Notification.countDocuments();
        if (total === 0) {
            seedData.push(
                {
                    title: 'Welcome to SMTBMS',
                    message: 'System is up and running. All modules are operational.',
                    type: 'info',
                    category: 'system',
                    user: null
                },
                {
                    title: 'System Maintenance',
                    message: 'Scheduled backup starting at 11:00 PM tonight.',
                    type: 'info',
                    category: 'system',
                    user: null
                }
            );
        }

        if (seedData.length > 0) {
            await Notification.insertMany(seedData);
        }

        res.json({ message: `Seeded ${seedData.length} notifications.` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    seedNotifications
};
