const Order = require('../models/Order');
const Material = require('../models/Material');
const MaterialMovement = require('../models/MaterialMovement');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Customer = require('../models/Customer');
const AuditLog = require('../models/AuditLog');
const { broadcast, notifyCritical, notifySales, notifyManager } = require('../services/notificationService');
const { logAudit } = require('../services/auditService');

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
        const allowedRoles = ['admin', 'super admin', 'manager', 'hr', 'customer'];
        if (!req.user || !allowedRoles.includes(req.user.role?.toLowerCase())) {
            return res.status(403).json({ message: 'Access Denied. You do not have permission to create orders.' });
        }

        const { customer, customerModel, vendor, items, totalAmount, status, orderNumber, orderType, orderDate, expectedDeliveryDate, notes } = req.body;
        
        if ((!customer && !vendor) || !items || items.length === 0) {
            return res.status(400).json({ message: 'Please provide customer/vendor and items' });
        }

        // Determine initial status based on role and type
        const isSales = orderType === 'sales' || !!customer;
        
        let initialStatus = 'Created';
        let initialApprovalStatus = 'Pending Manager Approval';
        let initialDeliveryStatus = 'Not Started';

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
            .populate('customer')
            .populate('vendor')
            .populate('items.material');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const prevStatus = order.status;
        
        // --- Sales Order Role-Based Pipeline Logic ---
        if (order.orderType === 'sales' || order.orderType === 'purchase') {
            const userRole = req.user?.role?.toLowerCase();
            const isAdmin = userRole === 'admin';

            if (status === 'Assigned to Employee') {
                if (!isAdmin && userRole !== 'manager') return res.status(403).json({ message: 'Only Manager or Admin can assign orders.' });
                if (!req.body.employeeId) return res.status(400).json({ message: 'Employee ID is required.' });
                
                order.employeeId = req.body.employeeId;
                
                await broadcast({
                    module: 'Orders',
                    referenceId: order._id || order.id,
                    title: `Order Assigned`,
                    message: `Order ${order.orderNumber} assigned to employee.`,
                    type: 'info',
                    targetRoles: ['Employee', 'Manager']
                });
            }
            else if (status === 'Material Confirmed') {
                if (!isAdmin && userRole !== 'employee') return res.status(403).json({ message: 'Only Employee or Admin can confirm materials.' });
                
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

                if (req.body.sourcedLocation) order.sourcedLocation = req.body.sourcedLocation;
                
                await broadcast({
                    module: 'Orders',
                    referenceId: order._id || order.id,
                    title: `Material Confirmed`,
                    message: `Materials for Order ${order.orderNumber} confirmed. Ready for delivery.`,
                    type: 'success',
                    targetRoles: ['Sales', 'Manager']
                });
            }
            else if (status === 'On Hold') {
                if (!isAdmin && userRole !== 'employee') return res.status(403).json({ message: 'Only Employee or Admin can put orders on hold.' });
                if (!req.body.reason) return res.status(400).json({ message: 'Reason is required when placing an order on hold.' });
                
                order.holdReason = req.body.reason;
            }
            else if (status === 'Ready for Delivery') {
                if (!isAdmin && userRole !== 'employee') return res.status(403).json({ message: 'Only Employee or Admin can mark ready for delivery.' });
            }
            else if (status === 'Out for Delivery') {
                if (!isAdmin && userRole !== 'sales') return res.status(403).json({ message: 'Only Sales or Admin can mark out for delivery.' });
                if (!isAdmin && prevStatus !== 'Material Confirmed' && prevStatus !== 'Ready for Delivery') {
                    return res.status(400).json({ message: 'Order must be Material Confirmed or Ready for Delivery first.' });
                }
            }
            else if (status === 'Delivered') {
                if (!isAdmin && userRole !== 'sales') return res.status(403).json({ message: 'Only Sales or Admin can mark delivered.' });
                
                if (prevStatus !== 'Delivered') {
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
                }
                
                order.deliveredAt = new Date();
                if (req.body.deliveryNotes) order.deliveryNotes = req.body.deliveryNotes;
                
                await broadcast({
                    module: 'Orders',
                    referenceId: order._id || order.id,
                    title: `Order Delivered`,
                    message: `Order ${order.orderNumber} delivered.`,
                    type: 'success',
                    targetRoles: ['Admin', 'Manager', 'Employee']
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
                    remarks: `${status === 'Approved' ? 'Approved by' : status === 'Material Confirmed' ? 'Confirmed by' : 'Updated by'} ${req.user.role || 'User'}`,
                    updatedBy: req.user.name,
                    updatedById: req.user.id
                }
            ];

            await AuditLog.create({
                userId: req.user.id,
                userName: req.user.name,
                action: 'UPDATE',
                module: 'Order',
                targetId: order.id,
                description: `Order status changed from ${prevStatus} to ${status}`,
                changes: { oldStatus: prevStatus, newStatus: status, role: req.user.role || 'user', remarks: `Updated via ${status} action` }
            }).catch(e => console.error('Failed to write AuditLog', e));
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

        // Manually populate material details for JSON field
        const Material = require('../models/Material');
        const allMaterials = await Material.find({});
        const matMap = {};
        allMaterials.forEach(m => matMap[String(m._id || m.id)] = m);

        const enrichedOrders = orders.map(ord => {
            const orderObj = ord.toJSON ? ord.toJSON() : (ord.toObject ? ord.toObject() : { ...ord });
            if (orderObj.items && Array.isArray(orderObj.items)) {
                orderObj.items = orderObj.items.map(item => {
                    const matId = typeof item.material === 'object' ? String(item.material._id || item.material.id || item.material) : String(item.material);
                    const mat = matMap[matId];
                    if (mat) {
                        return {
                            ...item,
                            material: {
                                _id: mat._id,
                                id: mat.id,
                                name: mat.name,
                                price: mat.price,
                                sku: mat.sku,
                                unit: mat.unit
                            }
                        };
                    }
                    return item;
                });
            }
            return orderObj;
        });

        res.json(enrichedOrders);
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

// @desc    Cancel a customer order
// @route   PUT /api/orders/:id/cancel
// @access  Private (Customer)
const cancelCustomerOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        // Verify customer
        const Customer = require('../models/Customer');
        const customerProfile = await Customer.findOne({ userId: req.user._id });
        if (!customerProfile) {
            return res.status(403).json({ message: 'Customer profile not found' });
        }
        
        const customerId = String(customerProfile._id || customerProfile.id);
        const orderCustomerId = String(order.customerId || order.customer);
        
        if (orderCustomerId !== customerId) {
            return res.status(403).json({ message: 'Not authorized to cancel this order' });
        }
        
        const nonCancellableStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Rejected'];
        if (nonCancellableStatuses.includes(order.status)) {
            return res.status(400).json({ message: `Cannot cancel order with status: ${order.status}` });
        }
        
        order.status = 'Cancelled';
        
        const currentTimeline = order.trackingTimeline || [];
        order.trackingTimeline = [
            ...currentTimeline,
            {
                id: Date.now().toString(),
                status: 'Cancelled',
                location: 'System Update',
                date: new Date().toISOString(),
                remarks: 'Order was cancelled by the customer.',
                updatedBy: req.user.name,
                updatedById: req.user.id
            }
        ];
        
        await order.save();
        res.json({ message: 'Order cancelled successfully', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get live GPS location for an order
// @route   GET /api/orders/:id/location
// @access  Private
const getLiveLocation = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).select('liveLocation routePath trackingStatus distanceRemaining deliveryETA status');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Manually flag an order delivery as delayed
// @route   PUT /api/orders/:id/delay
// @access  Private (Sales/Employee)
const flagAsDelayed = async (req, res) => {
    try {
        const { reason } = req.body;
        const order = await Order.findById(req.params.id);
        
        if (!order) return res.status(404).json({ message: 'Order not found' });
        
        order.trackingStatus = 'Delayed';
        order.holdReason = reason || 'Traffic or customer unavailable';
        await order.save();
        
        // Notify Manager
        const Notification = require('../models/Notification');
        await Notification.create({
            title: `Delivery Delayed: ${order.orderNumber}`,
            message: `Delivery has been flagged as delayed. Reason: ${order.holdReason}`,
            type: 'alert',
            role: 'Manager'
        });

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Manager approves the order and sets it to Awaiting Stock Check
// @route   PUT /api/orders/:id/manager-approve
// @access  Private (Manager/Admin)
const managerApproveOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        
        order.status = 'Awaiting Stock Check';
        order.approvalStatus = 'Approved';
        await order.save();

        await AuditLog.create({
            userId: req.user.id,
            userName: req.user.name,
            action: 'APPROVE',
            module: 'Order',
            targetId: order.id,
            description: `Manager approved Order ${order.orderNumber}`,
            changes: { oldStatus: 'Created', newStatus: 'Awaiting Stock Check', role: req.user.role, remarks: 'Manager approved the order' }
        }).catch(e => console.error('Failed to write AuditLog', e));
        
        await broadcast({
            module: 'Orders',
            referenceId: order._id || order.id,
            title: `New Order Pending Check: ${order.orderNumber}`,
            message: `Manager has approved the order. Please check stock levels.`,
            type: 'alert',
            targetRoles: ['Employee']
        });

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Employee checks order stock and forwards to Sales, or flags Low Stock
// @route   PUT /api/orders/:id/employee-check
// @access  Private (Employee)
const employeeCheckOrder = async (req, res) => {
    try {
        const { action } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        
        if (action === 'low_stock') {
            order.status = 'Low Stock Hold';
            order.holdReason = 'Insufficient stock detected by Employee';
            await order.save();
            
            await AuditLog.create({
                userId: req.user.id,
                userName: req.user.name,
                action: 'UPDATE',
                module: 'Order',
                targetId: order.id,
                description: `Employee flagged Low Stock for Order ${order.orderNumber}`,
                changes: { oldStatus: 'Awaiting Stock Check', newStatus: 'Low Stock Hold', role: req.user.role, remarks: 'Employee reported insufficient stock' }
            }).catch(e => console.error('Failed to write AuditLog', e));

            await broadcast({
                module: 'Orders',
                referenceId: order._id || order.id,
                title: `Low Stock Alert: ${order.orderNumber}`,
                message: `Employee reported low stock for this order.`,
                type: 'warning',
                targetRoles: ['Manager', 'Admin']
            });
        } else {
            order.status = 'Ready for Delivery';
            await order.save();
            
            await AuditLog.create({
                userId: req.user.id,
                userName: req.user.name,
                action: 'UPDATE',
                module: 'Order',
                targetId: order.id,
                description: `Employee verified stock for Order ${order.orderNumber}`,
                changes: { oldStatus: 'Awaiting Stock Check', newStatus: 'Ready for Delivery', role: req.user.role, remarks: 'Employee verified stock and forwarded to Sales' }
            }).catch(e => console.error('Failed to write AuditLog', e));

            await broadcast({
                module: 'Orders',
                referenceId: order._id || order.id,
                title: `Order Ready for Delivery: ${order.orderNumber}`,
                message: `Stock is available. Please proceed with delivery to customer.`,
                type: 'info',
                targetRoles: ['Sales', 'Manager']
            });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get orders for a specific customer by Admin
// @route   GET /api/orders/customer/:id
// @access  Private
const getCustomerOrdersById = async (req, res) => {
    try {
        const orders = await Order.find({ customerId: req.params.id, orderType: 'sales' })
            .populate('customer', 'name email phone company address')
            .populate('items.material', 'name price quantity')
            .sort({ createdAt: -1 });
        res.json(orders);
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
    employeeApprovePurchaseOrder,
    cancelCustomerOrder,
    getLiveLocation,
    flagAsDelayed,
    managerApproveOrder,
    employeeCheckOrder,
    getCustomerOrdersById
};
