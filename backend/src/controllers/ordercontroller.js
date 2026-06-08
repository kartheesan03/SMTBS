const Order = require('../models/Order');
const Material = require('../models/Material');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Customer = require('../models/Customer');
const { broadcast, notifyCritical, notifySales, notifyManager } = require('../services/notificationService');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private

const getOrderPayload = (order, reqUser) => {
    let name = 'Walk-in';
    if (order.orderType === 'purchase' && order.vendor) {
        name = order.vendor.name || order.vendor;
    } else if (order.customer) {
        name = order.customer.name || order.customer;
    }
    return {
        order_id: order._id || order.id,
        order_number: order.orderNumber,
        order_type: order.orderType,
        customer_or_vendor_name: name,
        status: order.status,
        created_by: reqUser?._id || 'System',
        created_at: new Date()
    };
};

const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('customer', 'name email')
            .populate('vendor', 'name email category contactPerson')
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
        const { customer, customerModel, vendor, items, totalAmount, status, orderNumber, orderType } = req.body;
        
        if ((!customer && !vendor) || !items || items.length === 0) {
            return res.status(400).json({ message: 'Please provide customer/vendor and items' });
        }

        // Determine initial status based on role and type
        let initialStatus = 'Pending';
        const isSales = orderType === 'sales' || !!customer;

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
            orderType: orderType || (isSales ? 'sales' : 'purchase'),
            createdById: req.user._id || null
        });

        // If it's already approved, update stock
        if (initialStatus === 'Approved') {
            await updateStock(items);
        }

        const populatedOrder = await Order.findById(createdOrder._id)
            .populate('customer', 'name')
            .populate('vendor', 'name');

        const payload = getOrderPayload(populatedOrder, req.user);

        if (initialStatus === 'Awaiting Stock Check') {
            await broadcast({
                title: `New Order Stock Check: ${createdOrder.orderNumber}`,
                message: `New order ${createdOrder.orderNumber} created. Please check stock availability.`,
                type: 'info',
                category: 'order',
                link: '/erp',
                targetRoles: ['Employee', 'Manager'],
                payload
            });
        } else {
            await broadcast({
                title: isSales ? 'New Sales Order Created' : 'New Purchase Order Created',
                message: `Order ${createdOrder.orderNumber} was created successfully.`,
                type: 'info',
                category: 'order',
                link: '/erp',
                targetRoles: isSales ? ['Sales', 'Manager'] : ['Manager'],
                payload
            });
        }

        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Helper to update stock
const updateStock = async (items, updateOrderType = 'sales') => {
    for (const item of items) {
        const material = await Material.findById(item.material);
        if (material) {
            if (updateOrderType === 'sales') {
                material.quantity -= item.quantity;
                if (material.quantity < 0) material.quantity = 0;
            } else if (updateOrderType === 'purchase') {
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
            .populate('customer', 'name email')
            .populate('vendor', 'name email');

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
        if (order.orderType === 'sales' && activeStates.includes(status) && inactiveStates.includes(prevStatus)) {
            await updateStock(order.items, 'sales');
        }
        
        // For Purchase: Add stock when moving to Delivered or Received
        const purchaseFinalStates = ['Delivered', 'Received', 'Completed'];
        if (order.orderType === 'purchase' && purchaseFinalStates.includes(status) && !purchaseFinalStates.includes(prevStatus)) {
            await updateStock(order.items, 'purchase');
        }

        // 1.5 Update Vendor Status if applicable
        if (order.orderType === 'purchase' && order.vendor) {
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
            const payload = getOrderPayload(updatedOrder, req.user);

            // A. Employee confirms stock -> Notify Sales
            if (status === 'Ready for Delivery') {
                await broadcast({
                    title: `Ready for Delivery: ${order.orderNumber}`,
                    message: `Order ${order.orderNumber} has sufficient stock and is Ready for Delivery. Please coordinate shipping to customer.`,
                    type: 'info',
                    category: 'order',
                    link: '/erp',
                    targetRoles: ['Sales', 'Manager'],
                    payload
                });
            }
            // B. Employee alerts low stock -> Notify Admin & Manager
            else if (status === 'Low Stock Alert') {
                await notifyCritical({
                    title: `Low Stock Alert: ${order.orderNumber}`,
                    message: `Low stock alert generated for order ${order.orderNumber}. Please purchase new material supply.`,
                    category: 'stock',
                    link: '/erp',
                    payload
                });
            }
            // C. Sales delivers order -> Notify ALL relevant users
            else if (status === 'Delivered') {
                await broadcast({
                    title: `Order Delivered: ${order.orderNumber}`,
                    message: `Order ${order.orderNumber} has been successfully delivered.`,
                    type: 'success',
                    category: 'order',
                    link: '/erp',
                    targetRoles: ['Sales', 'Manager', 'HR'], // Admin implicitly added
                    payload
                });
            }
            // D. Other updates
            else {
                await broadcast({
                    title: `Order Status Updated: ${order.orderNumber}`,
                    message: `Order ${order.orderNumber} status changed to "${status}".`,
                    type: 'info',
                    category: 'order',
                    link: '/erp',
                    targetRoles: ['Sales', 'Manager'],
                    payload
                });
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
