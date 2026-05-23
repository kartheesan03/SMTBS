const Order = require('../models/Order');
const Material = require('../models/Material');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('customer', 'name email');
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
        const updatedOrder = await order.save();

        // If status changed to Approved, update stock
        if (status === 'Approved' && prevStatus === 'Awaiting Approval') {
            await updateStock(order.items);
        }

        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getOrders, createOrder, updateOrderStatus };
