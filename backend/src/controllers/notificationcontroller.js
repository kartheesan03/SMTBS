const Notification = require('../models/Notification');
const Material = require('../models/Material');
const Order = require('../models/Order');

// @desc    Get all notifications (global + user-specific), newest first
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        let query = {};
        
        if (req.user.role !== 'Admin' && req.user.role !== 'Super Admin') {
            query = {
                $or: [
                    { userId: null },             // global notifications visible to all
                    { userId: req.user._id }      // user-specific notifications
                ]
            };

            if (req.user.role === 'HR') {
                query.category = { $in: ['hr', 'payroll', 'attendance', 'employee', 'system'] };
            }
        }

        let notifications = await Notification.find(query).sort({ createdAt: -1 });

        // Filter out order notifications where the order no longer exists
        const orderNotifications = notifications.filter(n => n.category === 'order' && n.payload?.order_id);
        if (orderNotifications.length > 0) {
            const orderIds = orderNotifications.map(n => n.payload.order_id);
            const validOrders = await Order.find({ id: { $in: orderIds } }).select('id');
            const validOrderIds = new Set(validOrders.map(o => (o.id || o._id).toString()));

            const invalidNotifs = orderNotifications.filter(n => !validOrderIds.has(n.payload.order_id.toString()));
            
            if (invalidNotifs.length > 0) {
                const invalidIds = invalidNotifs.map(n => n._id || n.id);
                await Notification.deleteMany({ _id: { $in: invalidIds } });
                notifications = notifications.filter(n => !invalidIds.includes(n._id || n.id));
            }
        }

        const unreadCount = notifications.filter(n => !n.isRead).length;

        res.json({ notifications, unreadCount });
    } catch (error) {
        console.error('getNotifications error:', error);
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
        if (notification.userId && notification.userId.toString() !== req.user._id.toString()) {
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
                    { userId: null },
                    { userId: req.user._id }
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

        await notification.destroy();
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
        const seedData = [];

        // Clean up legacy stock notifications (missing payload)
        await Notification.deleteMany({
            category: 'stock',
            'payload.material_id': { $exists: false }
        });

        // Check for actual low-stock materials and create real notifications
        try {
            const allMaterials = await Material.find({});
            
            for (const mat of allMaterials) {
                const qty = mat.quantity || 0;
                const threshold = mat.lowStockThreshold || 0;
                let status = 'In Stock';
                if (qty === 0) status = 'Out of Stock';
                else if (qty <= threshold && threshold > 0) status = 'Low Stock';

                if (status === 'In Stock') {
                    // Clear active stock notifications for this material
                    await Notification.deleteMany({
                        category: 'stock',
                        'payload.material_id': mat._id || mat.id,
                        isRead: false
                    });
                } else if (status === 'Low Stock') {
                    // Clear active out_of_stock
                    await Notification.deleteMany({
                        category: 'stock',
                        'payload.material_id': mat._id || mat.id,
                        'payload.alert_type': 'out_of_stock',
                        isRead: false
                    });

                    const exists = await Notification.findOne({
                        category: 'stock',
                        'payload.material_id': mat._id || mat.id,
                        'payload.alert_type': 'low_stock',
                        isRead: false
                    });
                    if (!exists) {
                        seedData.push({
                            title: `Low Stock Alert: ${mat.name}`,
                            message: `${mat.name} (SKU: ${mat.sku || 'N/A'}) reached critical level: ${qty} ${mat.unit || 'units'}.`,
                            type: 'warning',
                            category: 'stock',
                            userId: null,
                            payload: { material_id: mat._id || mat.id, alert_type: 'low_stock' }
                        });
                    }
                } else if (status === 'Out of Stock') {
                    // Clear active low_stock
                    await Notification.deleteMany({
                        category: 'stock',
                        'payload.material_id': mat._id || mat.id,
                        'payload.alert_type': 'low_stock',
                        isRead: false
                    });

                    const exists = await Notification.findOne({
                        category: 'stock',
                        'payload.material_id': mat._id || mat.id,
                        'payload.alert_type': 'out_of_stock',
                        isRead: false
                    });
                    if (!exists) {
                        seedData.push({
                            title: `Out of Stock Alert: ${mat.name}`,
                            message: `${mat.name} (SKU: ${mat.sku || 'N/A'}) is completely out of stock.`,
                            type: 'error',
                            category: 'stock',
                            userId: null,
                            payload: { material_id: mat._id || mat.id, alert_type: 'out_of_stock' }
                        });
                    }
                }
            }
        } catch (matErr) {
            console.warn('Could not check materials for stock status:', matErr.message);
        }

        // Add recent confirmed orders as notifications
        try {
            const confirmedOrders = await Order.find({ status: 'Confirmed' })
                .populate('customer', 'name')
                .populate('vendor', 'name')
                .sort({ createdAt: -1 })
                .limit(3);

            for (const order of confirmedOrders) {
                const exists = await Notification.findOne({
                    category: 'order',
                    title: `Order Confirmed: ${order.orderNumber}`
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
                        category: 'order',
                        userId: null,
                        payload: {
                            order_id: order._id || order.id,
                            order_number: order.orderNumber,
                            order_type: order.orderType,
                            customer_or_vendor_name: entityName,
                            status: order.status,
                            created_by: 'System',
                            created_at: new Date()
                        }
                    });
                }
            }
        } catch (orderErr) {
            console.warn('Could not check orders:', orderErr.message);
        }

        // Seed default system notification if none exist at all
        const total = await Notification.countDocuments({});
        if (total === 0) {
            seedData.push(
                {
                    title: 'Welcome to SMTBMS',
                    message: 'System is up and running. All modules are operational.',
                    type: 'info',
                    category: 'system',
                    userId: null
                },
                {
                    title: 'System Maintenance',
                    message: 'Scheduled backup starting at 11:00 PM tonight.',
                    type: 'info',
                    category: 'system',
                    userId: null
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
    markAsRead,
    markAllAsRead,
    deleteNotification,
    seedNotifications
};
