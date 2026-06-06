const Order = require('../models/Order');
const Material = require('../models/Material');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Customer = require('../models/Customer');

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
        const { customer, customerModel, vendor, items, totalAmount, status, orderNumber, type } = req.body;
        
        if ((!customer && !vendor) || !items || items.length === 0) {
            return res.status(400).json({ message: 'Please provide customer/vendor and items' });
        }

        // Determine initial status based on role and type
        let initialStatus = 'Pending';
        const isSales = type === 'Sales' || !!customer;

        // Verify customer exists if it's a Sales order
        if (isSales) {
            if (!customer) {
                return res.status(400).json({ message: 'Invalid customer or material selected.' });
            }
            let customerExists = null;
            if (customerModel === 'Lead') {
                const Lead = require('../models/Lead');
                customerExists = await Lead.findById(customer);
            } else {
                customerExists = await Customer.findById(customer);
            }
            if (!customerExists) {
                return res.status(400).json({ message: 'Invalid customer or material selected.' });
            }
        }

        // Verify materials exist
        for (const item of items) {
            if (!item.material) {
                return res.status(400).json({ message: 'Invalid customer or material selected.' });
            }
            const materialExists = await Material.findById(item.material);
            if (!materialExists) {
                return res.status(400).json({ message: 'Invalid customer or material selected.' });
            }
            if (item.quantity == null || item.quantity <= 0) {
                return res.status(400).json({ message: 'Invalid quantity.' });
            }
        }

        const createdOrder = await Order.create({
            orderNumber: orderNumber || `ORD-${Date.now().toString().slice(-6)}`,
            customer: customer || null,
            customerModel: customerModel || 'Customer',
            vendor: vendor || null,
            items,
            totalAmount,
            status: initialStatus,
            type: type || (isSales ? 'Sales' : 'Purchase'),
            createdById: req.user._id || null
        });

        // If it's already approved, update stock
        if (initialStatus === 'Approved') {
            await updateStock(items);
        }

        // Notify Employees (Warehouse) if status is 'Awaiting Stock Check'
        if (initialStatus === 'Awaiting Stock Check') {
            try {
                const employees = await User.find({ role: 'Employee' });
                const notifications = employees.map(emp => ({
                    userId: emp._id,
                    title: `New Order Stock Check: ${createdOrder.orderNumber}`,
                    message: `New order ${createdOrder.orderNumber} created by ${req.user.role} ${req.user.name}. Please check stock availability.`,
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
        } else if (req.user.role === 'HR' || req.user.role === 'Manager' || req.user.role === 'Admin') {
            try {
                const employees = await User.find({ role: 'Employee' });
                const notifications = employees.map(emp => ({
                    userId: emp._id,
                    title: `New Order: ${createdOrder.orderNumber}`,
                    message: `${req.user.role} ${req.user.name} created order ${createdOrder.orderNumber}.`,
                    type: 'info',
                    category: 'order',
                    link: '/erp'
                }));
                if (notifications.length > 0) {
                    await Notification.insertMany(notifications);
                }
            } catch (err) {
                console.error('Error creating fallback notifications:', err);
            }
        }

        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Helper to update stock
const updateStock = async (items, type = 'Sales') => {
    for (const item of items) {
        const material = await Material.findById(item.material);
        if (material) {
            if (type === 'Sales') {
                material.quantity -= item.quantity;
                if (material.quantity < 0) material.quantity = 0;
            } else if (type === 'Purchase') {
                material.quantity += item.quantity;
            }
            await material.save();
        }
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id)
            .populate('customer', 'name email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const prevStatus = order.status;
        order.status = status;
        order.updatedBy = req.user._id;
        const updatedOrder = await order.save();

        // 1. Stock deduction/addition trigger
        const activeStates = ['Ready for Delivery', 'Approved', 'Confirmed', 'Delivered', 'Received'];
        const inactiveStates = ['Awaiting Stock Check', 'Awaiting Approval', 'Pending', 'Low Stock Alert'];
        
        // For Sales: Deduct stock when moving from inactive to active
        if (order.type === 'Sales' && activeStates.includes(status) && inactiveStates.includes(prevStatus)) {
            await updateStock(order.items, 'Sales');
        }
        
        // For Purchase: Add stock when moving to Delivered or Received
        const purchaseFinalStates = ['Delivered', 'Received', 'Completed'];
        if (order.type === 'Purchase' && purchaseFinalStates.includes(status) && !purchaseFinalStates.includes(prevStatus)) {
            await updateStock(order.items, 'Purchase');
        }

        // 1.5 Update Vendor Status if applicable
        if (order.type === 'Purchase' && order.vendor) {
            try {
                const Vendor = require('../models/Vendor');
                const vendorObj = await Vendor.findById(order.vendor);
                if (vendorObj) {
                    let vendorStatus = vendorObj.status || 'Vendor Created';
                    if (status === 'Approved') vendorStatus = 'Purchase Order Received';
                    else if (status === 'Ready for Delivery') vendorStatus = 'Materials Supplied';
                    else if (status === 'Shipped') vendorStatus = 'In Transit';
                    else if (status === 'Delivered' || status === 'Received') vendorStatus = 'Delivered';
                    else if (status === 'Completed') vendorStatus = 'Completed';
                    
                    if (vendorObj.status !== vendorStatus) {
                        vendorObj.status = vendorStatus;
                        await vendorObj.save();
                    }
                }
            } catch (err) {
                console.error('Error updating vendor status:', err);
            }
        }

        // 2. Notification dispatching
        try {
            // A. Employee confirms stock -> Notify Sales
            if (status === 'Ready for Delivery') {
                const salesUsers = await User.find({ role: 'Sales' });
                const notifications = salesUsers.map(sales => ({
                    userId: sales._id,
                    title: `Ready for Delivery: ${order.orderNumber}`,
                    message: `Order ${order.orderNumber} has sufficient stock and is Ready for Delivery. Please coordinate shipping to customer.`,
                    type: 'info',
                    category: 'order',
                    link: '/erp'
                }));
                if (notifications.length > 0) {
                    await Notification.insertMany(notifications);
                }
            }
            
            // B. Employee alerts low stock -> Notify Admin & HR
            else if (status === 'Low Stock Alert') {
                const adminsAndHr = await User.find({ role: { $in: ['Admin', 'HR'] } });
                const notifications = adminsAndHr.map(u => ({
                    userId: u._id,
                    title: `Low Stock Alert: ${order.orderNumber}`,
                    message: `Low stock alert generated for order ${order.orderNumber}. Please purchase new material supply.`,
                    type: 'warning',
                    category: 'stock',
                    link: '/erp'
                }));
                if (notifications.length > 0) {
                    await Notification.insertMany(notifications);
                }
            }
            
            // C. Sales delivers order -> Notify ALL users
            else if (status === 'Delivered') {
                const allUsers = await User.find({});
                const notifications = allUsers.map(u => ({
                    userId: u._id,
                    title: `Order Delivered: ${order.orderNumber}`,
                    message: `Order ${order.orderNumber} has been successfully delivered to customer "${order.customer?.name || 'Walk-in'}" by Sales Representative ${req.user.name}!`,
                    type: 'success',
                    category: 'order',
                    link: '/erp'
                }));
                if (notifications.length > 0) {
                    await Notification.insertMany(notifications);
                }
            }
            
            // D. Other updates
            else {
                if (req.user.role === 'Employee') {
                    const salesUsers = await User.find({ role: 'Sales' });
                    const notifications = salesUsers.map(sales => ({
                        userId: sales._id,
                        title: `Order Status Updated: ${order.orderNumber}`,
                        message: `Employee ${req.user.name} updated the status of order ${order.orderNumber} to "${status}".`,
                        type: 'info',
                        category: 'order',
                        link: '/erp'
                    }));
                    if (notifications.length > 0) {
                        await Notification.insertMany(notifications);
                    }
                } else if (req.user.role === 'Sales') {
                    const adminsAndHr = await User.find({ role: { $in: ['Admin', 'HR'] } });
                    const notifications = adminsAndHr.map(u => ({
                        userId: u._id,
                        title: `Order Updated by Sales: ${order.orderNumber}`,
                        message: `Sales Representative ${req.user.name} updated order ${order.orderNumber} to "${status}".`,
                        type: 'info',
                        category: 'order',
                        link: '/erp'
                    }));
                    if (notifications.length > 0) {
                        await Notification.insertMany(notifications);
                    }
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
