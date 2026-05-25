const Order = require('../models/Order');
const Material = require('../models/Material');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('customer', 'name email')
            .populate('createdBy', 'name role')
            .populate('updatedBy', 'name role');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create an order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
    try {
        const { customer, vendor, items, totalAmount, status, orderNumber, type } = req.body;
        
        if ((!customer && !vendor) || !items || items.length === 0) {
            return res.status(400).json({ message: 'Please provide customer/vendor and items' });
        }

        // Determine initial status based on role
        let initialStatus = status || 'Pending';
        if (req.user.role === 'Manager') {
            initialStatus = 'Awaiting Approval';
        }

        const order = new Order({
            orderNumber: orderNumber || `ORD-${Date.now().toString().slice(-6)}`,
            customer,
            vendor,
            items,
            totalAmount,
            status: initialStatus,
            type: type || (customer ? 'Sales' : 'Purchase'),
            createdBy: req.user._id
        });

        const createdOrder = await order.save();

        // If it's already approved (e.g. created by Admin), update stock
        if (initialStatus !== 'Awaiting Approval') {
            await updateStock(items);
        }

        // Notify Employees (Warehouse) if created by HR or Manager or Admin
        if (req.user.role === 'HR' || req.user.role === 'Manager' || req.user.role === 'Admin') {
            try {
                const employees = await User.find({ role: 'Employee', active: true });
                const notifications = employees.map(emp => ({
                    user: emp._id,
                    title: `New Order: ${createdOrder.orderNumber}`,
                    message: `${req.user.role} ${req.user.name} created a new order ${createdOrder.orderNumber}. Please update and complete it.`,
                    type: 'info',
                    category: 'order',
                    link: '/erp'
                }));
                if (notifications.length > 0) {
                    await Notification.insertMany(notifications);
                }
            } catch (err) {
                console.error('Error creating notifications on order creation:', err);
            }
        }

        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Helper to update stock
const updateStock = async (items) => {
    for (const item of items) {
        const material = await Material.findById(item.material);
        if (material) {
            material.quantity -= item.quantity;
            if (material.quantity < 0) material.quantity = 0;
            await material.save();
        }
    }
};

// @desc    Update order status (Approve, etc)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const prevStatus = order.status;
        order.status = status;
        order.updatedBy = req.user._id;
        const updatedOrder = await order.save();

        // If status changed to Approved, update stock
        if (status === 'Approved' && prevStatus === 'Awaiting Approval') {
            await updateStock(order.items);
        }

        // Notify workflow transitions based on roles
        try {
            if (req.user.role === 'Employee') {
                // Employee/Warehouse updates -> Notify Sales
                const salesUsers = await User.find({ role: 'Sales', active: true });
                const notifications = salesUsers.map(sales => ({
                    user: sales._id,
                    title: `Order Updated by Warehouse: ${order.orderNumber}`,
                    message: `Employee ${req.user.name} updated the status of order ${order.orderNumber} to "${status}".`,
                    type: 'info',
                    category: 'order',
                    link: '/erp'
                }));
                if (notifications.length > 0) {
                    await Notification.insertMany(notifications);
                }
            } else if (req.user.role === 'Sales') {
                // Sales completes/updates -> Notify Admin & HR
                const adminsAndHr = await User.find({ role: { $in: ['Admin', 'HR'] }, active: true });
                const notifications = adminsAndHr.map(u => ({
                    user: u._id,
                    title: `Order Completed by Sales: ${order.orderNumber}`,
                    message: `Sales Representative ${req.user.name} has completed/updated order ${order.orderNumber} (Status: ${status}).`,
                    type: 'success',
                    category: 'order',
                    link: '/erp'
                }));
                if (notifications.length > 0) {
                    await Notification.insertMany(notifications);
                }
            }
        } catch (err) {
            console.error('Error dispatching update notifications:', err);
        }

        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getOrders, createOrder, updateOrderStatus };
