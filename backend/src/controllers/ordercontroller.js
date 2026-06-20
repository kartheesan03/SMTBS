const Order = require('../models/Order');
const Material = require('../models/Material');
const MaterialMovement = require('../models/MaterialMovement');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Customer = require('../models/Customer');
const { broadcast, notifyCritical, notifySales, notifyManager } = require('../services/notificationService');
const { logAudit } = require('../services/auditService');

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
        let query = {};
        const role = req.user?.role?.toLowerCase();
        
        if (role === 'admin' || role === 'super admin' || role === 'manager' || role === 'hr' || role === 'employee') {
            // Full access to view orders (frontend restricts actions for Employee)
        } else if (role === 'sales') {
            query.orderType = 'sales';
        } else if (role === 'vendor') {
            const Vendor = require('../models/Vendor');
            const vendorProfile = await Vendor.findOne({ userId: req.user._id });
            if (!vendorProfile) return res.status(403).json({ message: 'Vendor profile not found' });
            query.vendor = vendorProfile._id || vendorProfile.id;
            query.orderType = 'purchase';
        } else if (role === 'customer') {
            const Customer = require('../models/Customer');
            const customerProfile = await Customer.findOne({ userId: req.user._id });
            if (!customerProfile) return res.status(403).json({ message: 'Customer profile not found' });
            query.customer = customerProfile._id || customerProfile.id;
            query.orderType = 'sales';
        } else {
            return res.status(403).json({ message: 'Access Denied. Unauthorized role.' });
        }

        const orders = await Order.find(query)
            .populate('customer', 'name email phone company address')
            .populate('vendor', 'name email phone address contactPerson')
            .populate('items.material', 'name price quantity')
            .sort({ createdAt: -1 });

        // Collect unique user IDs for approvers and creators
        const userIds = new Set();
        orders.forEach(ord => {
            if (ord.createdById) userIds.add(String(ord.createdById));
            if (ord.approvedById) userIds.add(String(ord.approvedById));
            if (ord.employeeId) userIds.add(String(ord.employeeId));
        });

        const users = await User.find({ _id: { $in: Array.from(userIds) } }).select('name email role');
        const userMap = {};
        users.forEach(u => userMap[String(u._id)] = { name: u.name, email: u.email, role: u.role });

        const enrichedOrders = orders.map(ord => {
            const orderObj = ord.toJSON ? ord.toJSON() : (ord.toObject ? ord.toObject() : ord);
            return {
                ...orderObj,
                _approvers: {
                    creator: ord.createdById ? userMap[String(ord.createdById)] : null,
                    manager: ord.approvedById ? userMap[String(ord.approvedById)] : null,
                    employee: ord.employeeId ? userMap[String(ord.employeeId)] : null
                }
            };
        });

        console.log(`[API /orders] Fetched ${orders.length} orders.`);
        res.json(enrichedOrders);
    } catch (error) {
        console.error('[API /orders] Error:', error);
        res.status(500).json({ message: error.message });
    }
};



// @desc    Create an order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
    try {
        const allowedRoles = ['admin', 'super admin', 'manager', 'hr'];
        if (!req.user || !allowedRoles.includes(req.user.role?.toLowerCase())) {
            return res.status(403).json({ message: 'Access Denied. You do not have permission to create orders.' });
        }

        const { customer, customerModel, vendor, items, totalAmount, status, orderNumber, orderType, orderDate, expectedDeliveryDate, notes } = req.body;
        
        if ((!customer && !vendor) || !items || items.length === 0) {
            return res.status(400).json({ message: 'Please provide customer/vendor and items' });
        }

        // Determine initial status based on role and type
        const isSales = orderType === 'sales' || !!customer;
        let initialStatus = isSales ? 'Created' : 'Pending';
        let initialApprovalStatus = isSales ? 'Pending Manager Approval' : 'Pending';
        let initialDeliveryStatus = isSales ? 'Not Started' : 'Pending';

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

        // Generate Invoice Fields
        const invDate = new Date();
        const generatedInvoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
        let invDueDate = new Date(invDate);
        invDueDate.setDate(invDate.getDate() + 30); // Default to 30 days if expectedDeliveryDate is not provided

        const createdOrder = await Order.create({
            orderNumber: orderNumber || `ORD-${Date.now().toString().slice(-6)}`,
            customer: customer || null,
            customerModel: customerModel || 'Customer',
            vendor: vendor || null,
            items,
            totalAmount,
            status: initialStatus,
            approvalStatus: initialApprovalStatus,
            deliveryStatus: initialDeliveryStatus,
            orderType: orderType || (isSales ? 'sales' : 'purchase'),
            createdById: req.user._id || null,
            orderDate: orderDate ? new Date(orderDate) : new Date(),
            expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
            invoiceNumber: generatedInvoiceNumber,
            invoiceDate: invDate,
            invoiceDueDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : invDueDate,
            paymentStatus: 'Pending',
            notes: notes || null
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
                module: 'Orders',
                referenceId: createdOrder._id || createdOrder.id,
                title: `New Order Stock Check: ${createdOrder.orderNumber}`,
                message: `New order ${createdOrder.orderNumber} created. Please check stock availability.`,
                type: 'info',
                targetRoles: ['Employee', 'Manager']
            });
        } else {
            await broadcast({
                module: 'Orders',
                referenceId: createdOrder._id || createdOrder.id,
                title: isSales ? 'New Sales Order Created' : 'New Purchase Order Created',
                message: `Order ${createdOrder.orderNumber} was created successfully.`,
                type: 'info',
                targetRoles: isSales ? ['Sales', 'Manager'] : ['Manager']
            });
        }

        // Audit log
        await logAudit({
            user: req.user,
            action: 'CREATE',
            module: 'Order',
            targetId: createdOrder._id,
            description: `Order created: ${createdOrder.orderNumber} (${orderType || 'sales'})`,
            ipAddress: req.ip
        });

        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Helper to update stock (Purchase flow and legacy)
const updateStock = async (items, updateOrderType = 'sales', orderId = null, userId = null) => {
    for (const item of items) {
        const material = await Material.findById(item.material);
        if (material) {
            const previousQuantity = material.quantity;
            if (updateOrderType === 'sales') {
                material.quantity -= item.quantity;
                if (material.quantity < 0) material.quantity = 0;
            } else if (updateOrderType === 'purchase') {
                material.quantity += item.quantity;
            }
            await material.save();

            // Log material movement
            await MaterialMovement.create({
                materialId: material._id,
                type: updateOrderType === 'purchase' ? 'In' : 'Out',
                quantity: item.quantity,
                previousQuantity: previousQuantity,
                newQuantity: material.quantity,
                reason: `${updateOrderType === 'purchase' ? 'Purchase' : 'Sales'} order stock ${updateOrderType === 'purchase' ? 'addition' : 'deduction'}`,
                referenceOrderId: orderId || null,
                performedById: userId || null
            });
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
        
        // --- Sales Order Approval Workflow Logic ---
        if (order.orderType === 'sales') {
            const customerName = order.customer ? (order.customer.name || 'Walk-in') : 'Walk-in';
            const payload = getOrderPayload(order, req.user);
            const isSalesUser = req.user?.role?.toLowerCase() === 'sales';

            if (status === 'Manager Approved') {
                if (isSalesUser) return res.status(403).json({ message: 'Sales cannot approve orders.' });
                order.approvalStatus = 'Manager Approved';
                order.approvedById = req.user._id;
                order.approvedDate = new Date();
                
                await broadcast({
                    module: 'Orders',
                    referenceId: order._id || order.id,
                    title: `Sales Order Approved by Manager`,
                    message: `Order ${order.orderNumber} for ${customerName} has been approved by ${req.user.name || 'Manager'}. Stock check required.`,
                    type: 'info',
                    targetRoles: ['Employee']
                });
            } 
            else if (status === 'Employee Approved') {
                if (isSalesUser) return res.status(403).json({ message: 'Sales cannot approve orders.' });
                // Stock Validation
                for (const item of order.items) {
                    const material = await Material.findById(item.material);
                    if (!material) return res.status(400).json({ message: 'Material not found.' });
                    const availableStock = material.quantity - (material.reservedQuantity || 0);
                    if (availableStock < item.quantity) {
                        return res.status(400).json({ message: `Insufficient Stock for ${material.name}` });
                    }
                }
                
                // Reserve Stock
                for (const item of order.items) {
                    const material = await Material.findById(item.material);
                    material.reservedQuantity = (material.reservedQuantity || 0) + item.quantity;
                    await material.save();
                }

                order.approvalStatus = 'Employee Approved';
                order.employeeId = req.user._id;
                order.invoiceGenerated = true; // Auto-generated invoice flag

                await broadcast({
                    module: 'Orders',
                    referenceId: order._id || order.id,
                    title: `Sales Order Stock Verified`,
                    message: `Stock for Order ${order.orderNumber} (${customerName}) verified by ${req.user.name || 'Employee'}. Ready for processing.`,
                    type: 'success',
                    targetRoles: ['Sales', 'Admin', 'Manager']
                });
            }
            else if (status === 'Rejected') {
                if (isSalesUser) return res.status(403).json({ message: 'Sales cannot reject orders.' });
                order.approvalStatus = 'Rejected';
            } 
            else if (status === 'Processing') {
                order.deliveryStatus = 'Processing';
            } 
            else if (status === 'Shipped') {
                order.deliveryStatus = 'Shipped';
            } 
            else if (status === 'Delivered' && prevStatus !== 'Delivered') {
                // Deduct physical inventory & remove reservation
                for (const item of order.items) {
                    const material = await Material.findById(item.material);
                    if (material) {
                        material.quantity -= item.quantity;
                        material.reservedQuantity -= item.quantity;
                        if (material.quantity < 0) material.quantity = 0;
                        if (material.reservedQuantity < 0) material.reservedQuantity = 0;
                        await material.save();
                    }
                }
                order.deliveryStatus = 'Delivered';
                order.deliveryDate = new Date();
                order.deliveredAt = new Date();

                // Final comprehensive notification
                const targetUserIds = [];
                if (order.employeeId) targetUserIds.push(order.employeeId);
                
                await broadcast({
                    module: 'Orders',
                    referenceId: order._id || order.id,
                    title: `Sales Order Delivered`,
                    message: `Order ${order.orderNumber} for ${customerName} has been delivered by ${req.user.name || 'Sales'}. Workflow completed.`,
                    type: 'success',
                    targetRoles: ['Admin', 'Manager', 'HR', 'Sales'],
                    targetUserIds: targetUserIds
                });
            }
        }

        if (order.orderType === 'purchase' && status === 'Approved') {
            order.managerApproval = 'Approved';
        }

        order.status = status;
        order.updatedBy = req.user._id;

        // Ensure order status and tracking history are synced
        if (status !== prevStatus) {
            const currentTimeline = order.trackingTimeline || [];
            order.trackingTimeline = [
                ...currentTimeline,
                {
                    id: Date.now().toString(),
                    status: status,
                    location: 'System Update',
                    date: new Date().toISOString(),
                    remarks: `Status updated from ${prevStatus} to ${status}`,
                    updatedBy: req.user.name,
                    updatedById: req.user.id
                }
            ];
        }

        const updatedOrder = await order.save();

        // 1. Stock deduction/addition trigger for Purchase
        const purchaseFinalStates = ['Delivered', 'Received', 'Completed'];
        if (order.orderType === 'purchase' && purchaseFinalStates.includes(status) && !purchaseFinalStates.includes(prevStatus)) {
            await updateStock(order.items, 'purchase', order._id, req.user?._id);
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

            // Sales specific new notifications
            if (order.orderType === 'sales') {
                if (status === 'Confirmed') {
                    await broadcast({
                        module: 'Orders', referenceId: order._id || order.id,
                        title: `Order Approved: ${order.orderNumber}`,
                        message: `Order ${order.orderNumber} has been approved and confirmed.`,
                        type: 'success', targetRoles: ['Sales', 'Manager']
                    });
                } else if (status === 'Rejected') {
                    await broadcast({
                        module: 'Orders', referenceId: order._id || order.id,
                        title: `Order Rejected: ${order.orderNumber}`,
                        message: `Order ${order.orderNumber} has been rejected.`,
                        type: 'error', targetRoles: ['Sales', 'Manager']
                    });
                } else if (status === 'Shipped') {
                    await broadcast({
                        module: 'Orders', referenceId: order._id || order.id,
                        title: `Order Shipped: ${order.orderNumber}`,
                        message: `Order ${order.orderNumber} has been shipped.`,
                        type: 'info', targetRoles: ['Sales', 'Manager']
                    });
                } else if (status === 'Delivered') {
                    await broadcast({
                        module: 'Orders', referenceId: order._id || order.id,
                        title: `Order Delivered: ${order.orderNumber}`,
                        message: `Order ${order.orderNumber} has been successfully delivered.`,
                        type: 'success', targetRoles: ['Sales', 'Manager', 'HR']
                    });
                }
            } else {
                // A. Employee confirms stock -> Notify Sales
                if (status === 'Ready for Delivery') {
                    await broadcast({
                        module: 'Orders', referenceId: order._id || order.id,
                        title: `Ready for Delivery: ${order.orderNumber}`,
                        message: `Order ${order.orderNumber} has sufficient stock and is Ready for Delivery. Please coordinate shipping to customer.`,
                        type: 'info',
                        targetRoles: ['Sales', 'Manager']
                    });
                }
                // B. Employee alerts low stock -> Notify Admin & Manager
                else if (status === 'Low Stock Alert') {
                    await notifyCritical({
                        module: 'Orders', referenceId: order._id || order.id,
                        title: `Low Stock Alert: ${order.orderNumber}`,
                        message: `Low stock alert generated for order ${order.orderNumber}. Please purchase new material supply.`,
                        type: 'warning'
                    });
                }
                // C. Sales delivers order -> Notify ALL relevant users
                else if (status === 'Delivered') {
                    await broadcast({
                        module: 'Orders', referenceId: order._id || order.id,
                        title: `Order Delivered: ${order.orderNumber}`,
                        message: `Order ${order.orderNumber} has been successfully delivered.`,
                        type: 'success',
                        targetRoles: ['Sales', 'Manager', 'HR']
                    });
                }
                // D. Other updates
                else {
                    await broadcast({
                        module: 'Orders', referenceId: order._id || order.id,
                        title: `Order Status Updated: ${order.orderNumber}`,
                        message: `Order ${order.orderNumber} status changed to "${status}".`,
                        type: 'info',
                        targetRoles: ['Sales', 'Manager']
                    });
                }
            }
        } catch (err) {
            console.error('Error dispatching update notifications:', err);
        }

        // Audit log
        await logAudit({
            user: req.user,
            action: 'UPDATE',
            module: 'Order',
            targetId: order._id,
            description: `Order ${order.orderNumber} status changed: ${prevStatus} → ${status}`,
            changes: { status: { from: prevStatus, to: status } },
            ipAddress: req.ip
        });

        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentStatus } = req.body;

        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.paymentStatus = paymentStatus;
        await order.save();
        res.json({ message: `Payment status updated to ${paymentStatus}`, order });
    } catch (error) {
        res.status(500).json({ message: 'Server error updating payment status' });
    }
};

const updateTrackingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, location, date, remarks } = req.body;

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const newTrackingUpdate = {
            id: Date.now().toString(),
            status,
            location,
            date: date || new Date().toISOString(),
            remarks,
            updatedBy: req.user.name,
            updatedById: req.user.id
        };

        const currentTimeline = order.trackingTimeline || [];
        order.trackingTimeline = [...currentTimeline, newTrackingUpdate];

        order.status = status;
        order.deliveryStatus = status;

        if (status === 'Delivered') {
            order.deliveryDate = new Date(newTrackingUpdate.date);
            order.deliveredAt = new Date(newTrackingUpdate.date);
        }

        await order.save();

        res.json({ message: 'Tracking status updated successfully', order });
    } catch (error) {
        console.error('Update Tracking Status Error:', error);
        res.status(500).json({ message: 'Server error updating tracking status' });
    }
};

const getMyCustomerOrders = async (req, res) => {
    try {
        const customer = await Customer.findOne({ userId: req.user._id });
        if (!customer) {
            return res.status(404).json({ message: 'Customer profile not found' });
        }
        const orders = await Order.find({ customerId: customer._id || customer.id })
            .populate('vendor', 'name email category contactPerson')
            .populate('createdBy', 'name role')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createCustomerOrder = async (req, res) => {
    try {
        const customerProfile = await Customer.findOne({ userId: req.user._id });
        if (!customerProfile) {
            return res.status(400).json({ message: 'Please complete your customer profile first.' });
        }

        req.body.customer = customerProfile._id || customerProfile.id;
        req.body.customerModel = 'Customer';
        req.body.orderType = 'sales';
        
        await createOrder(req, res);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an order
// @route   DELETE /api/orders/:id
// @access  Private (Admin/Manager)
const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Audit log before deletion
        await logAudit({
            user: req.user,
            action: 'DELETE',
            module: 'Order',
            targetId: order._id || order.id,
            description: `Order deleted: ${order.orderNumber} (${order.orderType || 'sales'})`,
            ipAddress: req.ip
        });

        await order.remove(); // or Order.findByIdAndDelete depending on mongoose vs sequelize
        res.json({ message: 'Order removed successfully' });
    } catch (error) {
        console.error('[API DELETE /orders/:id] Error:', error);
        res.status(500).json({ message: error.message });
    }
};

const employeeApprovePurchaseOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // 'Approve' or 'Reject'
        
        const order = await Order.findById(id).populate('vendor', 'name');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        
        if (order.orderType !== 'purchase') {
            return res.status(400).json({ message: 'Only purchase orders can be approved by this endpoint' });
        }
        
        if (order.managerApproval !== 'Approved') {
            return res.status(400).json({ message: 'Manager must approve this purchase order first' });
        }
        
        const vendorName = order.vendor ? (order.vendor.name || 'Vendor') : 'Vendor';
        
        if (action === 'Approve') {
            order.employeeApproval = 'Approved';
            order.status = 'Confirmed'; // finalStatus updates correctly
            
            await broadcast({
                module: 'Orders',
                referenceId: order._id || order.id,
                title: 'Purchase Order Employee Approved',
                message: `Employee ${req.user.name} approved the purchase order ${order.orderNumber} for ${vendorName}.`,
                type: 'success',
                targetRoles: ['Manager', 'Sales', 'Admin']
            });
        } else if (action === 'Reject') {
            order.employeeApproval = 'Rejected';
            order.status = 'Rejected'; // finalStatus updates correctly
            
            await broadcast({
                module: 'Orders',
                referenceId: order._id || order.id,
                title: 'Purchase Order Employee Rejected',
                message: `Employee ${req.user.name} rejected the purchase order ${order.orderNumber} for ${vendorName}.`,
                type: 'error',
                targetRoles: ['Manager', 'Admin']
            });
        } else {
            return res.status(400).json({ message: 'Invalid action. Use Approve or Reject.' });
        }
        
        order.updatedBy = req.user._id;
        
        // Log action in tracking timeline
        const currentTimeline = order.trackingTimeline || [];
        order.trackingTimeline = [
            ...currentTimeline,
            {
                id: Date.now().toString(),
                status: action === 'Approve' ? 'Employee Approved' : 'Employee Rejected',
                location: 'System Update',
                date: new Date().toISOString(),
                remarks: `Employee has ${action.toLowerCase()}ed the purchase order.`,
                updatedBy: req.user.name,
                updatedById: req.user.id
            }
        ];
        
        await order.save();
        
        // Audit log
        await logAudit({
            user: req.user,
            action: 'UPDATE',
            module: 'Order',
            targetId: order._id,
            description: `Employee ${action.toLowerCase()}ed purchase order ${order.orderNumber}`,
            ipAddress: req.ip
        });
        
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getOrders,
    createOrder,
    updateOrderStatus,
    updatePaymentStatus,
    updateTrackingStatus,
    getMyCustomerOrders,
    createCustomerOrder,
    deleteOrder,
    employeeApprovePurchaseOrder
};
