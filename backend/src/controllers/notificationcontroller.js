const Notification = require('../models/Notification');
const Material = require('../models/Material');
const Order = require('../models/Order');
const getNotifications = async (req, res) => {
    try {
        const query = {
            $or: [
                { userId: null, role: null },
                { userId: req.user.id || req.user._id },
                { role: req.user.role, userId: null }
            ]
        };
        const notifications = await Notification.find(query)
            .select('title message status type module referenceId createdAt userId role')
            .sort({ createdAt: -1 })
            .limit(50);
        const unreadCount = notifications.filter(n => n.status === 'unread').length;
        res.json({ notifications, unreadCount });
    } catch (error) {
        console.error('getNotifications error:', error);
        res.status(500).json({ message: error.message });
    }
};
const getUnreadCount = async (req, res) => {
    try {
        let query = { 
            status: 'unread',
            $or: [
                { userId: null, role: null },
                { userId: req.user.id || req.user._id },
                { role: req.user.role, userId: null }
            ]
        };
        const count = await Notification.countDocuments(query);
        res.json({ unreadCount: count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        notification.status = 'read';
        await notification.save();
        res.json({ message: 'Notification marked as read', notification });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const markAllAsRead = async (req, res) => {
    try {
        let query = { 
            status: 'unread',
            $or: [
                { userId: null, role: null },
                { userId: req.user._id },
                { userId: req.user.id },
                { role: req.user.role, userId: null }
            ]
        };
        await Notification.updateMany(
            query,
            { $set: { status: 'read' } }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        await notification.destroy();
        res.json({ message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const seedNotifications = async (req, res) => {
    try {
        const seedData = [];
        try {
            const allMaterials = await Material.find({});
            for (const mat of allMaterials) {
                const qty = mat.quantity || 0;
                const threshold = mat.lowStockThreshold || 0;
                let status = 'In Stock';
                if (qty === 0) status = 'Out of Stock';
                else if (qty <= threshold && threshold > 0) status = 'Low Stock';
                if (status === 'Low Stock') {
                    const exists = await Notification.findOne({
                        module: 'Materials',
                        referenceId: mat._id || mat.id,
                        type: 'warning',
                        status: 'unread'
                    });
                    if (!exists) {
                        seedData.push({
                            title: `Low Stock Alert: ${mat.name}`,
                            message: `${mat.name} (SKU: ${mat.sku || 'N/A'}) reached critical level: ${qty} ${mat.unit || 'units'}.`,
                            type: 'warning',
                            module: 'Materials',
                            referenceId: String(mat._id || mat.id),
                            userId: null,
                            role: 'Manager',
                            status: 'unread'
                        });
                    }
                } else if (status === 'Out of Stock') {
                    const exists = await Notification.findOne({
                        module: 'Materials',
                        referenceId: mat._id || mat.id,
                        type: 'error',
                        status: 'unread'
                    });
                    if (!exists) {
                        seedData.push({
                            title: `Out of Stock Alert: ${mat.name}`,
                            message: `${mat.name} (SKU: ${mat.sku || 'N/A'}) is completely out of stock.`,
                            type: 'error',
                            module: 'Materials',
                            referenceId: String(mat._id || mat.id),
                            userId: null,
                            role: 'Manager',
                            status: 'unread'
                        });
                    }
                }
            }
        } catch (matErr) {
            console.warn('Could not check materials for stock status:', matErr.message);
        }
        try {
            const confirmedOrders = await Order.find({ status: 'Confirmed' })
                .populate('customer', 'name')
                .populate('vendor', 'name')
                .sort({ createdAt: -1 })
                .limit(3);
            for (const order of confirmedOrders) {
                const exists = await Notification.findOne({
                    module: 'Orders',
                    referenceId: order._id || order.id
                });
                if (!exists) {
                    const isPurchase = order.orderType === 'purchase';
                    const entityName = isPurchase 
                        ? (order.vendor?.name || 'a vendor') 
                        : (order.customer?.name || 'a customer');
                    seedData.push({
                        title: `Order Confirmed: ${order.orderNumber}`,
                        message: `Order ${order.orderNumber} from ${entityName} has been confirmed.`,
                        type: 'success',
                        module: 'Orders',
                        referenceId: String(order._id || order.id),
                        userId: null,
                        role: 'Sales',
                        status: 'unread'
                    });
                }
            }
        } catch (orderErr) {
            console.warn('Could not check orders:', orderErr.message);
        }
        const total = await Notification.countDocuments({});
        if (total === 0) {
            seedData.push(
                {
                    title: 'Welcome to SMTBMS',
                    message: 'System is up and running. All modules are operational.',
                    type: 'info',
                    module: 'System',
                    referenceId: 'sys-start',
                    userId: null,
                    role: null,
                    status: 'unread'
                },
                {
                    title: 'System Maintenance',
                    message: 'Scheduled backup starting at 11:00 PM tonight.',
                    type: 'info',
                    module: 'System',
                    referenceId: 'sys-maint',
                    userId: null,
                    role: null,
                    status: 'unread'
                }
            );
        }
        if (seedData.length > 0) {
            await Notification.insertMany(seedData);
        }
        res.json({ message: `Seeded ${seedData.length} notifications.` });
    } catch (error) {
        console.error('seedNotifications error:', error);
        res.status(500).json({ message: error.message });
    }
};
module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    seedNotifications
};
