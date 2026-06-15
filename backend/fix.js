const fs = require('fs');
const path = 'c:/Users/Admin/Documents/project/backend/src/controllers/ordercontroller.js';
let content = fs.readFileSync(path, 'utf8');
const startIdx = content.indexOf('const updateOrderStatus = async (req, res) => {');
const endIdx = content.indexOf('const updatePaymentStatus = async (req, res) => {');

const replacement = `const updateOrderStatus = async (req, res) => {
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

            if (status === 'Manager Approved') {
                order.approvalStatus = 'Manager Approved';
                order.approvedById = req.user._id;
                order.approvedDate = new Date();
                
                await broadcast({
                    title: \`Sales Order Approved by Manager\`,
                    message: \`Order \${order.orderNumber} for \${customerName} has been approved by \${req.user.name || 'Manager'}. Stock check required.\`,
                    type: 'info',
                    category: 'order',
                    link: '/erp',
                    targetRoles: ['Employee'],
                    payload
                });
            } 
            else if (status === 'Employee Approved') {
                // Stock Validation
                for (const item of order.items) {
                    const material = await Material.findById(item.material);
                    if (!material) return res.status(400).json({ message: 'Material not found.' });
                    const availableStock = material.quantity - (material.reservedQuantity || 0);
                    if (availableStock < item.quantity) {
                        return res.status(400).json({ message: \`Insufficient Stock for \${material.name}\` });
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
                    title: \`Sales Order Stock Verified\`,
                    message: \`Stock for Order \${order.orderNumber} (\${customerName}) verified by \${req.user.name || 'Employee'}. Ready for processing.\`,
                    type: 'success',
                    category: 'order',
                    link: '/erp',
                    targetRoles: ['Sales', 'Admin', 'Manager'],
                    payload
                });
            }
            else if (status === 'Rejected') {
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
                    title: \`Sales Order Delivered\`,
                    message: \`Order \${order.orderNumber} for \${customerName} has been delivered by \${req.user.name || 'Sales'}. Workflow completed.\`,
                    type: 'success',
                    category: 'order',
                    link: '/erp',
                    targetRoles: ['Admin', 'Manager', 'HR', 'Sales'],
                    targetUserIds: targetUserIds,
                    payload
                });
            }
        }

        order.status = status;
        order.updatedBy = req.user._id;
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
                        title: \`Order Approved: \${order.orderNumber}\`,
                        message: \`Order \${order.orderNumber} has been approved and confirmed.\`,
                        type: 'success', category: 'order', link: '/erp', targetRoles: ['Sales', 'Manager'], payload
                    });
                } else if (status === 'Rejected') {
                    await broadcast({
                        title: \`Order Rejected: \${order.orderNumber}\`,
                        message: \`Order \${order.orderNumber} has been rejected.\`,
                        type: 'error', category: 'order', link: '/erp', targetRoles: ['Sales', 'Manager'], payload
                    });
                } else if (status === 'Shipped') {
                    await broadcast({
                        title: \`Order Shipped: \${order.orderNumber}\`,
                        message: \`Order \${order.orderNumber} has been shipped.\`,
                        type: 'info', category: 'order', link: '/erp', targetRoles: ['Sales', 'Manager'], payload
                    });
                } else if (status === 'Delivered') {
                    await broadcast({
                        title: \`Order Delivered: \${order.orderNumber}\`,
                        message: \`Order \${order.orderNumber} has been successfully delivered.\`,
                        type: 'success', category: 'order', link: '/erp', targetRoles: ['Sales', 'Manager', 'HR'], payload
                    });
                }
            } else {
                // A. Employee confirms stock -> Notify Sales
                if (status === 'Ready for Delivery') {
                    await broadcast({
                        title: \`Ready for Delivery: \${order.orderNumber}\`,
                        message: \`Order \${order.orderNumber} has sufficient stock and is Ready for Delivery. Please coordinate shipping to customer.\`,
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
                        title: \`Low Stock Alert: \${order.orderNumber}\`,
                        message: \`Low stock alert generated for order \${order.orderNumber}. Please purchase new material supply.\`,
                        category: 'stock',
                        link: '/erp',
                        payload
                    });
                }
                // C. Sales delivers order -> Notify ALL relevant users
                else if (status === 'Delivered') {
                    await broadcast({
                        title: \`Order Delivered: \${order.orderNumber}\`,
                        message: \`Order \${order.orderNumber} has been successfully delivered.\`,
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
                        title: \`Order Status Updated: \${order.orderNumber}\`,
                        message: \`Order \${order.orderNumber} status changed to "\${status}".\`,
                        type: 'info',
                        category: 'order',
                        link: '/erp',
                        targetRoles: ['Sales', 'Manager'],
                        payload
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
            description: \`Order \${order.orderNumber} status changed: \${prevStatus} → \${status}\`,
            changes: { status: { from: prevStatus, to: status } },
            ipAddress: req.ip
        });

        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

`;

content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
fs.writeFileSync(path, content, 'utf8');
console.log('Fixed successfully');
